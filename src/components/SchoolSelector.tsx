import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, School as SchoolIcon, MapPin, Loader2 } from "lucide-react";

interface SchoolRow {
  id: string;
  nat_emis: string;
  institution_name: string;
  province: string;
  district: string | null;
  town_city: string | null;
  quintile: string | null;
  learners_2024: number | null;
}

interface SchoolSelectorProps {
  value?: SchoolRow | null;
  onSelect: (school: SchoolRow) => void;
  defaultProvince?: string;
}

const PROVINCES = [
  { code: "EC", label: "Eastern Cape" },
  { code: "FS", label: "Free State" },
  { code: "GT", label: "Gauteng" },
  { code: "KZN", label: "KwaZulu-Natal" },
  { code: "LP", label: "Limpopo" },
  { code: "MP", label: "Mpumalanga" },
  { code: "NC", label: "Northern Cape" },
  { code: "NW", label: "North West" },
  { code: "WC", label: "Western Cape" },
];

export const SchoolSelector = ({ value, onSelect, defaultProvince = "WC" }: SchoolSelectorProps) => {
  const [province, setProvince] = useState(defaultProvince);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!province) return;
      setLoading(true);
      let q = supabase
        .from("schools")
        .select("id, nat_emis, institution_name, province, district, town_city, quintile, learners_2024")
        .eq("province", province)
        .order("institution_name", { ascending: true })
        .limit(30);
      if (search.trim()) {
        q = q.ilike("institution_name", `%${search.trim()}%`);
      }
      const { data } = await q;
      setResults(data || []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [province, search]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Province</Label>
          <Select value={province} onValueChange={setProvince}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROVINCES.map((p) => (
                <SelectItem key={p.code} value={p.code}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label>Search your school</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Type school name…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
            />
          </div>
        </div>
      </div>

      {value && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <SchoolIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{value.institution_name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {[value.town_city, value.district, value.province].filter(Boolean).join(" · ")}
              {value.quintile && <span className="ml-2 px-1.5 py-0.5 rounded bg-secondary text-foreground">Quintile {value.quintile}</span>}
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="border rounded-lg max-h-72 overflow-y-auto bg-card">
          {loading && (
            <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No schools found. Try a different search.</div>
          )}
          {!loading && results.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { onSelect(s); setOpen(false); setSearch(s.institution_name); }}
              className="w-full text-left px-3 py-2 hover:bg-secondary border-b last:border-b-0 border-border"
            >
              <div className="font-medium text-sm truncate">{s.institution_name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {[s.town_city, s.district].filter(Boolean).join(" · ")}
                {s.quintile && ` · Q${s.quintile.replace(/[^\d]/g, "") || s.quintile}`}
                {s.learners_2024 ? ` · ${s.learners_2024} learners` : ""}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolSelector;
