export interface SchoolData {
  nat_emis: string;
  province: string;
  institution_name: string;
  status: string;
  sector: string;
  type_doe: string;
  phase_ped: string;
  district: string;
  circuit: string;
  quintile: string;
  no_fee_school: string;
  urban_rural: string;
  longitude: number | null;
  latitude: number | null;
  town_city: string;
  suburb: string;
  township_village: string;
  street_address: string;
  postal_address: string;
  telephone: string;
  learners_2024: number;
  educators_2024: number;
}

export const parseSchoolRow = (row: any): SchoolData | null => {
  try {
    // Helper function to convert any value to string
    const toString = (val: any): string => {
      if (val === null || val === undefined) return '';
      return String(val).trim();
    };

    // Parse and validate coordinates
    const parseLongitude = (val: any): number | null => {
      const num = parseFloat(val);
      if (isNaN(num) || num < -180 || num > 180) return null;
      return num;
    };

    const parseLatitude = (val: any): number | null => {
      const num = parseFloat(val);
      if (isNaN(num) || num < -90 || num > 90) return null;
      return num;
    };

    return {
      nat_emis: toString(row.NatEmis || row.NATEMIS),
      province: toString(row.Province),
      institution_name: toString(row.Official_Institution_Name || row.Institution_Name),
      status: toString(row.Status),
      sector: toString(row.Sector),
      type_doe: toString(row.Type_DoE),
      phase_ped: toString(row.Phase_PED),
      district: toString(row.EIDistrict),
      circuit: toString(row.EICircuit),
      quintile: toString(row.Quintile),
      no_fee_school: toString(row.NoFeeSchool),
      urban_rural: toString(row.Urban_Rural),
      longitude: parseLongitude(row.GIS_Longitude || row.Longitude),
      latitude: parseLatitude(row.GIS_Latitude || row.Latitude),
      town_city: toString(row.Town_City || row.towncity),
      suburb: toString(row.Suburb),
      township_village: toString(row.Township_Village),
      street_address: toString(row.StreetAddress),
      postal_address: toString(row.PostalAddress),
      telephone: toString(row.Telephone),
      learners_2024: parseInt(row.Learners2024) || 0,
      educators_2024: parseInt(row.Educators2024) || 0,
    };
  } catch (error) {
    console.error('Error parsing school row:', error);
    return null;
  }
};