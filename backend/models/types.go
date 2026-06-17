package models

// PredictRequest mirrors the Python sidecar InferRequest
type PredictRequest struct {
	Latitude      float64  `json:"latitude" binding:"required"`
	Longitude     float64  `json:"longitude" binding:"required"`
	EventType     string   `json:"event_type" binding:"required"`
	EventCause    string   `json:"event_cause" binding:"required"`
	StartHour     int      `json:"start_hour" binding:"required,min=0,max=23"`
	DayOfWeek     int      `json:"day_of_week" binding:"min=0,max=6"`
	Month         int      `json:"month" binding:"required,min=1,max=12"`
	Day           int      `json:"day" binding:"required,min=1,max=31"`
	Corridor      *string  `json:"corridor,omitempty"`
	PoliceStation *string  `json:"police_station,omitempty"`
	Zone          *string  `json:"zone,omitempty"`
	VehType       *string  `json:"veh_type,omitempty"`
	DurationMins  *float64 `json:"duration_mins,omitempty"`
	Junction      *string  `json:"junction,omitempty"`
}

// Recommendations from the ML engine
type Recommendations struct {
	PriorityFlag  string  `json:"priority_flag"`
	ManpowerMin   int     `json:"manpower_min"`
	ManpowerMax   int     `json:"manpower_max"`
	Barricading   string  `json:"barricading"`
	Diversion     string  `json:"diversion"`
	ImpactMinutes int     `json:"impact_minutes"`
	PreDeploy     *string `json:"pre_deploy,omitempty"`
	PeakNote      *string `json:"peak_note,omitempty"`
	SpecialAction *string `json:"special_action,omitempty"`
}

// PredictResponse is the final JSON sent to the frontend
type PredictResponse struct {
	SeverityLevel       int                `json:"severity_level"`
	SeverityLabel       string             `json:"severity_label"`
	Confidence          float64            `json:"confidence"`
	ClassProbabilities  map[string]float64 `json:"class_probabilities"`
	Recommendations     Recommendations    `json:"recommendations"`
	LocationCluster     int                `json:"location_cluster"`
}

// MetaResponse from /meta endpoint on sidecar
type MetaResponse struct {
	Corridors      []string `json:"corridors"`
	PoliceSations  []string `json:"police_stations"`
	Zones          []string `json:"zones"`
}
