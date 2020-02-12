import NodeGeocoder from 'node-geocoder';

var options = {
  provider: process.env.GEO_CODE_PROVIDER,

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: process.env.GEO_CODE_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
};

export const geocode = NodeGeocoder(options as any);
