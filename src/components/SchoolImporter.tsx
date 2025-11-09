import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileCheck } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { parseSchoolRow } from "@/utils/parseSchoolData";
import { supabase } from "@/integrations/supabase/client";
import { getPublicErrorMessage } from "@/utils/errorMapping";
import { validateFile } from "@/utils/sanitize";

const SchoolImporter = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [totalSchools, setTotalSchools] = useState(0);
  const [importedSchools, setImportedSchools] = useState(0);


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate all files first
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        if (event.target) event.target.value = '';
        return;
      }
    }

    setIsImporting(true);
    setProgress(0);
    setImportedSchools(0);
    let totalImported = 0;

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setCurrentFile(file.name);
        
        // Parse the file
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const schools = jsonData
          .map(parseSchoolRow)
          .filter(school => school !== null);

        if (schools.length === 0) {
          toast.error(`No valid schools found in ${file.name}`);
          setProgress(((i + 1) / fileArray.length) * 100);
          continue;
        }

        setTotalSchools(schools.length);

        // Call the import edge function with auth header
        const { data: { session } } = await supabase.auth.getSession()
        const { data: result, error } = await supabase.functions.invoke('import-schools', {
          body: { schools },
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });

        if (error) throw error;

        totalImported += schools.length;
        setImportedSchools(totalImported);
        setProgress(((i + 1) / fileArray.length) * 100);
        
        toast.success(`Imported ${schools.length} schools from ${file.name}`);
      }

      toast.success(`Successfully imported ${totalImported} schools total!`);
    } catch (error: any) {
      console.error('[DEBUG] Import error:', error);
      toast.error(getPublicErrorMessage(error));
    } finally {
      setIsImporting(false);
      setCurrentFile("");
      setProgress(0);
      setTotalSchools(0);
      setImportedSchools(0);
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
              accept=".xlsx,.xls,.csv"
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

          {isImporting && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-primary" />
                  <span className="font-medium">Processing: {currentFile}</span>
                </div>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Current file: {totalSchools} schools</span>
                <span className="font-semibold text-primary">
                  Total imported: {importedSchools} schools
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolImporter;
