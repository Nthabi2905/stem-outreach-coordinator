import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { parseSchoolRow } from "@/utils/parseSchoolData";
import { supabase } from "@/integrations/supabase/client";

const SchoolImporter = () => {
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    let totalImported = 0;

    try {
      for (const file of Array.from(files)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const schools = jsonData
          .map(parseSchoolRow)
          .filter(school => school !== null);

        if (schools.length === 0) {
          toast.error(`No valid schools found in ${file.name}`);
          continue;
        }

        // Call the import edge function
        const { data: result, error } = await supabase.functions.invoke('import-schools', {
          body: { schools }
        });

        if (error) throw error;

        totalImported += schools.length;
        toast.success(`Imported ${schools.length} schools from ${file.name}`);
      }

      toast.success(`Successfully imported ${totalImported} schools total!`);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || "Failed to import schools");
    } finally {
      setIsImporting(false);
      if (event.target) event.target.value = '';
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Import Schools Data</CardTitle>
        <CardDescription>
          Upload Excel files containing school data to import into the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Select one or more Excel files to import
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              multiple
              onChange={handleFileUpload}
              disabled={isImporting}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={isImporting}>
                <span>
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Select Files
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolImporter;
