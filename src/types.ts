export type ConnectionState = "IDLE" | "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR";

export type Speaker = "USER" | "AGENT" | "SYSTEM";

export interface TranscriptMessage {
  id: string;
  speaker: Speaker;
  text: string;
  timestamp: Date;
  isFinal?: boolean;
}

export interface AppConfig {
  apiKey: string;
  model: string;
  voice: string;
  systemInstruction: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  type: string;
  price: string;
  image: string;
  super_area: string;
  carpet_area: string;
  desc: string;
  dimensions: {
    master_bedroom: string;
    bedroom_2: string;
    bedroom_3: string;
    bedroom_4: string;
    living_dining: string;
    kitchen: string;
    balconies: string;
    bathrooms: string;
  };
  locality: {
    metro: string;
    school: string;
    hospital: string;
    commercial: string;
    market: string;
    rating: string;
    mall: string;
  };
  amenities: string[];
}

export interface PropertyRecommend {
  id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  features: string[];
}
