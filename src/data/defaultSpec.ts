/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking, SystemConfig } from '../types';

export const LUXURY_SUITES = [
  { name: 'The Royal Penthouse', pricePerNight: 1200, capacity: 4, size: '250 m²', view: 'Panoramic Ocean & Skyline' },
  { name: 'The Sapphire Suite', pricePerNight: 750, capacity: 2, size: '120 m²', view: 'Marina Bay Waterfront' },
  { name: 'The Emerald Villa', pricePerNight: 950, capacity: 6, size: '310 m²', view: 'Tropical Garden & Private Pool' },
  { name: 'The Obsidian Loft', pricePerNight: 600, capacity: 2, size: '95 m²', view: 'Industrial Urban Heights' },
];

export const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'DS-B001',
    guestName: 'Lord Sterling Vance',
    email: 'sterling@vancecap.com',
    suiteName: 'The Royal Penthouse',
    checkIn: '2026-07-10',
    checkOut: '2026-07-15',
    status: 'Confirmed',
    totalPrice: 6000,
    guestsCount: 2
  },
  {
    id: 'DS-B002',
    guestName: 'Lady Genevieve Dupond',
    email: 'genevieve.dupond@mansion.fr',
    suiteName: 'The Sapphire Suite',
    checkIn: '2026-07-04',
    checkOut: '2026-07-08',
    status: 'Checked-In',
    totalPrice: 3000,
    guestsCount: 1
  },
  {
    id: 'DS-B003',
    guestName: 'Dr. Alistair Thorne',
    email: 'thorne@oxford.edu',
    suiteName: 'The Obsidian Loft',
    checkIn: '2026-06-28',
    checkOut: '2026-07-02',
    status: 'Completed',
    totalPrice: 2400,
    guestsCount: 2
  },
  {
    id: 'DS-B004',
    guestName: 'Sophia Laurent',
    email: 'sophia@laurentdesign.co',
    suiteName: 'The Emerald Villa',
    checkIn: '2026-07-20',
    checkOut: '2026-07-24',
    status: 'Pending',
    totalPrice: 3800,
    guestsCount: 4
  }
];

export const INITIAL_CONFIG: SystemConfig = {
  dbProvider: 'PostgreSQL (Cloud SQL)',
  authProvider: 'Firebase Auth',
  aiModel: 'gemini-2.5-flash',
  deployTarget: 'Google Cloud Run',
  environment: 'Production',
  encryptionLevel: 'AES-GCM (Chacha20)',
  backupFrequency: 'Daily Automatic',
  complianceGdpr: true,
  complianceSoc2: true,
};

export function generateSpecText(config: SystemConfig): {
  id: string;
  title: string;
  paragraphs: string[];
}[] {
  return [
    {
      id: '01',
      title: 'Platform Foundations & Security Control',
      paragraphs: [
        `The secure identity layer of Divine Suites is powered by ${config.authProvider}, providing structured access control across client-facing web touchpoints and internal operator management panels. Identity federation conforms to OAuth 2.0 and OIDC specifications, enabling secure token issuance with short-lived access credentials and cryptographic token rotation. Role-Based Access Control (RBAC) is enforced server-side, separating Guest, Property Manager, and Global Administrator profiles.`,
        `Core database persistence is orchestrated using ${config.dbProvider}, serving as the transactional system of record for inventory, guest accounts, and financial ledger data. The persistence schema enforces atomic booking states, indexing for rapid spatial queries of geographical property dimensions, and automated connection pooling to maintain high-throughput query pipelines. Database communications are shielded via SSL/TLS client certificates, with structured backups executing on a ${config.backupFrequency} interval and database volumes encrypted via ${config.encryptionLevel}.`
      ]
    },
    {
      id: '02',
      title: 'Booking Management & Predictive Intelligence Engine',
      paragraphs: [
        `The Booking Management module handles real-time luxury suite reservation lifecycles. It utilizes double-booking mitigation strategies through transactional isolation levels (Serializable) within ${config.dbProvider} or optimistic concurrency control, ensuring immediate lock-outs during highly-contested reservation requests. Room allocation is synchronized through an event-driven inventory service that broadcasts state transitions via WebSocket adapters to active booking client frontends, eliminating race conditions.`,
        `Reservation processing triggers the predictive intelligence pipeline running the ${config.aiModel} model hosted in Google AI Studio. This engine analyzes current occupancy levels, seasonal trend coefficients, and historical property pricing margins to output dynamically adjusted room rates. Additionally, the AI integration serves as a 24/7 autonomous concierge, processing guest check-in preferences and custom reservation inquiries to compose deterministic, context-grounded natural language replies.`
      ]
    },
    {
      id: '03',
      title: 'DevOps Pipelines, Scalable Containers, & Site Reliability',
      paragraphs: [
        `The application microservices are packaged as lightweight, multi-stage Docker containers and deployed to ${config.deployTarget} for rapid, horizontal auto-scaling and zero-downtime rolling updates. The container orchestration is configured with strict cpu limits, concurrency thresholds, and memory resource allocations, ensuring cost-efficient scaling down to zero replicas during low-traffic periods and instantaneous cold starts during peak reservation windows.`,
        `Continuous Integration and Continuous Deployment (CI/CD) pipelines execute automatic TypeScript typechecking, system linting, and database migration checks before publishing revision-tagged artifacts to Google Artifact Registry. System observability, error tracing, and API latency metrics are streamed in real time to Google Cloud Observability platforms, validating regulatory compliance logs and ensuring complete auditability under ${config.complianceGdpr ? 'GDPR' : 'standard local'} regulations and ${config.complianceSoc2 ? 'SOC2 Security Trust principles' : 'internal baseline policies'}.`
      ]
    }
  ];
}
