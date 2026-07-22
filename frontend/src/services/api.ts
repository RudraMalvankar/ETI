import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface PlantNode {
  id: string;
  label: string;
  type: 'sensor' | 'equipment' | 'valve' | 'reactor' | 'pump';
  status: 'nominal' | 'warning' | 'critical' | 'isolated' | 'failed';
  telemetry?: {
    pressure?: string;
    temperature?: string;
    flow?: string;
  };
  designSpecs?: {
    maxPressure?: string;
    oemManual?: string;
    tag?: string;
  };
  x: number;
  y: number;
}

export interface PlantEdge {
  id: string;
  source: string;
  target: string;
  status: 'nominal' | 'active_propagation' | 'isolated';
}

export interface RunbookStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  assignedRole: string;
  isLotoRequired: boolean;
  lotoStatus: 'pending' | 'verified' | 'skipped';
  isCompleted: boolean;
  citation: {
    documentName: string;
    section: string;
    page: number;
    confidence: number;
  };
  estimatedTime: string;
}

export interface RunbookData {
  id: string;
  title: string;
  anomalyTrigger: string;
  riskLevel: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  estimatedResolutionTime: string;
  timeSavedVsManual: string;
  steps: RunbookStep[];
  matchedHistoricalIncident?: {
    id: string;
    title: string;
    date: string;
    plant: string;
    similarity: number;
  };
}

export interface ComplianceStandard {
  code: string;
  name: string;
  authority: 'OISD' | 'PESO' | 'Factory Act';
  status: 'COMPLIANT' | 'WARNING' | 'GAP_DETECTED';
  lastAudit: string;
  requirement: string;
}

// Fallback Mock Data for instant high-fidelity demo
export const MOCK_GRAPH_INITIAL: { nodes: PlantNode[]; edges: PlantEdge[] } = {
  nodes: [
    {
      id: 'R-101',
      label: 'Primary Reactor R-101',
      type: 'reactor',
      status: 'critical',
      telemetry: { pressure: '18.4 Bar (MAX: 15.0)', temperature: '285°C' },
      designSpecs: { maxPressure: '15.0 Bar', oemManual: 'OEM-R101-REV3.pdf', tag: 'R-101' },
      x: 120,
      y: 180,
    },
    {
      id: 'PT-401',
      label: 'Pressure Sensor PT-401',
      type: 'sensor',
      status: 'critical',
      telemetry: { pressure: '18.4 Bar' },
      designSpecs: { oemManual: 'SENS-PT401.pdf', tag: 'PT-401' },
      x: 300,
      y: 120,
    },
    {
      id: 'V-102',
      label: 'Emergency Isolation Valve V-102',
      type: 'valve',
      status: 'failed',
      telemetry: { flow: '0 L/min (STUCK OPEN)' },
      designSpecs: { oemManual: 'VALVE-V102-SPEC.pdf', tag: 'V-102' },
      x: 480,
      y: 180,
    },
    {
      id: 'V-108',
      label: 'Bypass Relief Valve V-108',
      type: 'valve',
      status: 'warning',
      telemetry: { flow: 'Standby' },
      designSpecs: { oemManual: 'VALVE-V108-BYPASS.pdf', tag: 'V-108' },
      x: 480,
      y: 300,
    },
    {
      id: 'P-202A',
      label: 'Cooling Water Pump P-202A',
      type: 'pump',
      status: 'nominal',
      telemetry: { flow: '420 L/min' },
      designSpecs: { oemManual: 'PUMP-P202A-OEM.pdf', tag: 'P-202A' },
      x: 660,
      y: 180,
    },
    {
      id: 'FS-01',
      label: 'Flare Stack Diverter FS-01',
      type: 'equipment',
      status: 'nominal',
      telemetry: { flow: '0 L/min' },
      designSpecs: { oemManual: 'FLARE-FS01-SPEC.pdf', tag: 'FS-01' },
      x: 660,
      y: 300,
    },
  ],
  edges: [
    { id: 'e1', source: 'R-101', target: 'PT-401', status: 'active_propagation' },
    { id: 'e2', source: 'R-101', target: 'V-102', status: 'active_propagation' },
    { id: 'e3', source: 'V-102', target: 'P-202A', status: 'active_propagation' },
    { id: 'e4', source: 'R-101', target: 'V-108', status: 'nominal' },
    { id: 'e5', source: 'V-108', target: 'FS-01', status: 'nominal' },
  ],
};

export const MOCK_GRAPH_REROUTED: { nodes: PlantNode[]; edges: PlantEdge[] } = {
  nodes: [
    {
      id: 'R-101',
      label: 'Primary Reactor R-101',
      type: 'reactor',
      status: 'warning',
      telemetry: { pressure: '15.2 Bar (DROPPING)', temperature: '270°C' },
      designSpecs: { maxPressure: '15.0 Bar', oemManual: 'OEM-R101-REV3.pdf', tag: 'R-101' },
      x: 120,
      y: 180,
    },
    {
      id: 'PT-401',
      label: 'Pressure Sensor PT-401',
      type: 'sensor',
      status: 'warning',
      telemetry: { pressure: '15.2 Bar' },
      designSpecs: { oemManual: 'SENS-PT401.pdf', tag: 'PT-401' },
      x: 300,
      y: 120,
    },
    {
      id: 'V-102',
      label: 'Emergency Isolation Valve V-102',
      type: 'valve',
      status: 'failed',
      telemetry: { flow: 'ISOLATED/BLOCKED' },
      designSpecs: { oemManual: 'VALVE-V102-SPEC.pdf', tag: 'V-102' },
      x: 480,
      y: 180,
    },
    {
      id: 'V-108',
      label: 'Bypass Relief Valve V-108',
      type: 'valve',
      status: 'critical',
      telemetry: { flow: '650 L/min (ACTIVE RELIEF)' },
      designSpecs: { oemManual: 'VALVE-V108-BYPASS.pdf', tag: 'V-108' },
      x: 480,
      y: 300,
    },
    {
      id: 'P-202A',
      label: 'Cooling Water Pump P-202A',
      type: 'pump',
      status: 'nominal',
      telemetry: { flow: '550 L/min (FULL COOLING)' },
      designSpecs: { oemManual: 'PUMP-P202A-OEM.pdf', tag: 'P-202A' },
      x: 660,
      y: 180,
    },
    {
      id: 'FS-01',
      label: 'Flare Stack Diverter FS-01',
      type: 'equipment',
      status: 'warning',
      telemetry: { flow: '650 L/min (VENTING)' },
      designSpecs: { oemManual: 'FLARE-FS01-SPEC.pdf', tag: 'FS-01' },
      x: 660,
      y: 300,
    },
  ],
  edges: [
    { id: 'e1', source: 'R-101', target: 'PT-401', status: 'nominal' },
    { id: 'e2', source: 'R-101', target: 'V-102', status: 'isolated' },
    { id: 'e3', source: 'V-102', target: 'P-202A', status: 'isolated' },
    { id: 'e4', source: 'R-101', target: 'V-108', status: 'active_propagation' },
    { id: 'e5', source: 'V-108', target: 'FS-01', status: 'active_propagation' },
  ],
};

export const MOCK_RUNBOOK_INITIAL: RunbookData = {
  id: 'RB-2026-9042',
  title: 'Reactor R-101 Pressure Surge & Isolation Failure Mitigation',
  anomalyTrigger: 'PT-401 Pressure High (18.4 Bar > 15.0 Bar Safe Operating Limit)',
  riskLevel: 'CRITICAL',
  estimatedResolutionTime: '8 Minutes',
  timeSavedVsManual: '42 Minutes Saved vs Manual Search',
  matchedHistoricalIncident: {
    id: 'INC-2022-402',
    title: 'High-Pressure Seal Overpressure at Gujarat Plant B',
    date: '14 Oct 2022',
    plant: 'Refinery Complex 2',
    similarity: 94.2,
  },
  steps: [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'Verify Isolation Valve V-102 Position',
      description:
        'Check local position indicator on Valve V-102. Attempt manual override wheel turning counter-clockwise.',
      assignedRole: 'Field Technician',
      isLotoRequired: true,
      lotoStatus: 'verified',
      isCompleted: true,
      citation: {
        documentName: 'SOP-OPS-R101-SAFETY.pdf',
        section: 'Section 4.2: Emergency Valve Overrides',
        page: 18,
        confidence: 0.98,
      },
      estimatedTime: '2 mins',
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: 'Execute Lockout/Tagout (LOTO) on Primary Feed Line',
      description:
        'Apply LOTO Lock ID #LOTO-901 to feed valve handle and verify zero mechanical backlash.',
      assignedRole: 'Safety Officer',
      isLotoRequired: true,
      lotoStatus: 'pending',
      isCompleted: false,
      citation: {
        documentName: 'OISD-STD-117-COMPLIANCE.pdf',
        section: 'Clause 7.3: Hazardous Energy Control',
        page: 34,
        confidence: 0.96,
      },
      estimatedTime: '3 mins',
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'Engage Auxiliary Cooling Water Pump P-202A',
      description:
        'Increase cooling circulation flow to 500 L/min to stabilize exothermic reactor thermal escalation.',
      assignedRole: 'Control Room Operator',
      isLotoRequired: false,
      lotoStatus: 'pending',
      isCompleted: false,
      citation: {
        documentName: 'OEM-R101-MANUAL.pdf',
        section: 'Section 9.1: Thermal Stabilization',
        page: 112,
        confidence: 0.95,
      },
      estimatedTime: '3 mins',
    },
  ],
};

export const MOCK_RUNBOOK_REROUTED: RunbookData = {
  id: 'RB-2026-9042-ADAPTED',
  title: 'REROUTED: Reactor R-101 Emergency Pressure Relief via Bypass V-108',
  anomalyTrigger: 'Valve V-102 STUCK OPEN | Dynamic Causal Graph Re-route Activated',
  riskLevel: 'CRITICAL',
  estimatedResolutionTime: '6 Minutes',
  timeSavedVsManual: '48 Minutes Saved vs Manual Search',
  matchedHistoricalIncident: {
    id: 'INC-2022-402',
    title: 'High-Pressure Seal Overpressure at Gujarat Plant B',
    date: '14 Oct 2022',
    plant: 'Refinery Complex 2',
    similarity: 94.2,
  },
  steps: [
    {
      id: 'step-r1',
      stepNumber: 1,
      title: 'Flag Valve V-102 Mechanically Jammed',
      description:
        'Primary isolation pathway failed. Automated causal shadow-run switched mitigation vector to Bypass Line B.',
      assignedRole: 'APEX Autopilot Engine',
      isLotoRequired: false,
      lotoStatus: 'verified',
      isCompleted: true,
      citation: {
        documentName: 'GRAPH-CAUSAL-MODEL.json',
        section: 'Reroute Topology Node V-108',
        page: 1,
        confidence: 0.99,
      },
      estimatedTime: 'Instant',
    },
    {
      id: 'step-r2',
      stepNumber: 2,
      title: 'Manually Actuate Bypass Relief Valve V-108',
      description:
        'Rotate bypass valve V-108 to 100% open position to direct pressure surge directly to Flare Stack FS-01.',
      assignedRole: 'Field Technician',
      isLotoRequired: true,
      lotoStatus: 'verified',
      isCompleted: false,
      citation: {
        documentName: 'VALVE-V108-BYPASS-MANUAL.pdf',
        section: 'Section 3.1: Emergency Venting Protocol',
        page: 12,
        confidence: 0.97,
      },
      estimatedTime: '2 mins',
    },
    {
      id: 'step-r3',
      stepNumber: 3,
      title: 'Verify Flare Stack FS-01 Flare Igniter Status',
      description:
        'Confirm automatic pilot ignition on Flare Stack FS-01 to safely combust vented hydrocarbon effluent.',
      assignedRole: 'Control Room Operator',
      isLotoRequired: false,
      lotoStatus: 'pending',
      isCompleted: false,
      citation: {
        documentName: 'PESO-RULE14-SAFETY.pdf',
        section: 'Schedule VI: Hydrocarbon Venting Safeguards',
        page: 45,
        confidence: 0.96,
      },
      estimatedTime: '2 mins',
    },
  ],
};

export const MOCK_COMPLIANCE: ComplianceStandard[] = [
  {
    code: 'OISD-STD-117',
    name: 'Fire Protection & Emergency Shutdown Systems',
    authority: 'OISD',
    status: 'COMPLIANT',
    lastAudit: '2026-06-15',
    requirement: 'Mandatory dual emergency isolation valves on Class-A pressure vessels.',
  },
  {
    code: 'PESO Rule 14',
    name: 'Unfired Pressure Vessels (UPV) Safety Rules',
    authority: 'PESO',
    status: 'COMPLIANT',
    lastAudit: '2026-05-10',
    requirement: 'Calibrated relief valves must vent to flare headers with digital audit log.',
  },
  {
    code: 'Factory Act Sec 31',
    name: 'Pressure Plant Operational Safety Audit',
    authority: 'Factory Act',
    status: 'GAP_DETECTED',
    lastAudit: '2026-04-20',
    requirement: 'Quarterly LOTO sign-off logs required for all field technician overrides.',
  },
];

// API Service Wrapper
export const apexApi = {
  getGraphState: async (isRerouted: boolean = false) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/graph/blast-radius`);
      return res.data;
    } catch {
      return isRerouted ? MOCK_GRAPH_REROUTED : MOCK_GRAPH_INITIAL;
    }
  },

  getRunbook: async (isRerouted: boolean = false) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/runbook/current`);
      return res.data;
    } catch {
      return isRerouted ? MOCK_RUNBOOK_REROUTED : MOCK_RUNBOOK_INITIAL;
    }
  },

  triggerStepReroute: async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/runbook/RB-2026-9042/regenerate`);
      return res.data;
    } catch {
      return MOCK_RUNBOOK_REROUTED;
    }
  },

  searchCopilot: async (query: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      return res.data;
    } catch {
      return {
        query,
        answer: `According to **OEM-R101-REV3.pdf (Section 4.2)** and **OISD-STD-117 (Clause 7.3)**, equipment tag **${query.toUpperCase() || 'R-101'}** has a maximum safe operating limit of **15.0 Bar**. In the event of isolation failure, operators must activate Bypass Valve V-108 to redirect relief stream to Flare Stack FS-01 within 10 minutes.`,
        confidence: 0.97,
        citations: [
          {
            document: 'OEM-R101-REV3.pdf',
            section: 'Section 4.2: Overpressure Thresholds',
            page: 18,
          },
          {
            document: 'OISD-STD-117-SAFETY.pdf',
            section: 'Clause 7.3: Flare Redirection Protocols',
            page: 34,
          },
        ],
      };
    }
  },
};
