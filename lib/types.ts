export type GpsCheckpoint = {
  id: string;
  type: 'gps';
  lat: number;
  lng: number;
  title: string;
  description?: string;
};

export type MarkerCheckpoint = {
  id: string;
  type: 'marker';
  markerImageUrl: string;
  title: string;
  description?: string;
};

export type PasscodeCheckpoint = {
  id: string;
  type: 'passcode';
  passcode: string;
  title: string;
  description?: string;
};

export type Checkpoint = GpsCheckpoint | MarkerCheckpoint | PasscodeCheckpoint;

export type CollectedStamp = {
  checkpointId: string;
  title: string;
  collectedAt: string;
};
