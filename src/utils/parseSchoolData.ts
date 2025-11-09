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
    const longitude = parseFloat(row.GIS_Longitude || row.Longitude);
    const latitude = parseFloat(row.GIS_Latitude || row.Latitude);

    // Helper function to convert any value to string
    const toString = (val: any): string => {
      if (val === null || val === undefined) return '';
      return String(val).trim();
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
      longitude: !isNaN(longitude) ? longitude : null,
      latitude: !isNaN(latitude) ? latitude : null,
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