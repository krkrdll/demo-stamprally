export type ConditionGps = {
  id: string;
  type: 'gps';
  lat: number;
  lng: number;
};

export type ConditionMarker = {
  id: string;
  type: 'marker';
  markerImageUrl: string;
};

export type ConditionPasscode = {
  id: string;
  type: 'passcode';
  passcode: string;
};

export type CheckpointCondition = ConditionGps | ConditionMarker | ConditionPasscode;

export type Checkpoint = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  conditions: CheckpointCondition[];
};

export type CollectedStamp = {
  checkpointId: string;
  title: string;
  collectedAt: string;
};

// Legacy type aliases (for camera page backward compat)
export type GpsCheckpoint = Checkpoint & { conditions: [ConditionGps, ...CheckpointCondition[]] };
export type MarkerCheckpoint = Checkpoint & { conditions: [ConditionMarker, ...CheckpointCondition[]] };
