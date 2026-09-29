// Demo data. "Today" is fixed so overdue logic stays stable while you design.
export const TODAY = '2026-09-20';

export const people = [
  { id: 'priya', name: 'Priya Nair', role: 'Product manager', capacity: 10 },
  { id: 'amara', name: 'Amara Okafor', role: 'Backend engineer', capacity: 16 },
  { id: 'kenji', name: 'Kenji Watanabe', role: 'Frontend engineer', capacity: 16 },
  { id: 'lucia', name: 'Lucía Herrera', role: 'QA engineer', capacity: 14 },
  { id: 'tomas', name: 'Tomás Silva', role: 'Platform engineer', capacity: 16 },
  { id: 'sofia', name: 'Sofia Lindqvist', role: 'Product designer', capacity: 14 },
  { id: 'daniel', name: 'Daniel Mensah', role: 'Mobile engineer', capacity: 12 },
  { id: 'hana', name: 'Hana Kim', role: 'Data engineer', capacity: 16 },
];

export const getPerson = (id) => people.find((p) => p.id === id);

export const projects = [
  {
    id: 'billing',
    name: 'Billing API v2',
    lead: 'priya',
    status: 'at-risk',
    progress: 62,
    due: '2026-10-16',
    tasksDone: 31,
    tasksTotal: 50,
    milestones: [
      { name: 'Schema freeze', due: '2026-09-11', done: true },
      { name: 'Webhooks on v2', due: '2026-09-23', done: false },
      { name: 'Partner sandbox', due: '2026-10-09', done: false },
      { name: 'General availability', due: '2026-10-16', done: false },
    ],
  },
  {
    id: 'web',
    name: 'Onboarding revamp',
    lead: 'sofia',
    status: 'on-track',
    progress: 71,
    due: '2026-10-09',
    tasksDone: 22,
    tasksTotal: 31,
    milestones: [
      { name: 'Research readout', due: '2026-08-28', done: true },
      { name: 'Checklist rebuild', due: '2026-09-25', done: false },
      { name: 'Beta with 5 accounts', due: '2026-10-02', done: false },
      { name: 'Launch', due: '2026-10-09', done: false },
    ],
  },
  {
    id: 'mobile',
    name: 'Field check-ins 3.0',
    lead: 'daniel',
    status: 'delayed',
    progress: 38,
    due: '2026-10-02',
    tasksDone: 12,
    tasksTotal: 32,
    milestones: [
      { name: 'API contract agreed', due: '2026-09-04', done: true },
      { name: 'Offline queue', due: '2026-09-18', done: false },
      { name: 'Android 13 fixes', due: '2026-09-25', done: false },
      { name: 'Store release', due: '2026-10-02', done: false },
    ],
  },
  {
    id: 'platform',
    name: 'Search canary rollout',
    lead: 'tomas',
    status: 'on-track',
    progress: 80,
    due: '2026-09-30',
    tasksDone: 16,
    tasksTotal: 20,
    milestones: [
      { name: 'Staging parity', due: '2026-09-09', done: true },
      { name: 'Canary at 5%', due: '2026-09-17', done: true },
      { name: 'Canary at 50%', due: '2026-09-24', done: false },
      { name: 'Full rollout', due: '2026-09-30', done: false },
    ],
  },
  {
    id: 'data',
    name: 'Retention analytics',
    lead: 'hana',
    status: 'at-risk',
    progress: 54,
    due: '2026-10-23',
    tasksDone: 13,
    tasksTotal: 24,
    milestones: [
      { name: 'Event schema v3', due: '2026-09-22', done: false },
      { name: 'Cohort queries', due: '2026-10-06', done: false },
      { name: 'Dashboard for support', due: '2026-10-23', done: false },
    ],
  },
];

export const COLUMNS = [
  { id: 'todo', label: 'To do' },
  { id: 'progress', label: 'In progress' },
  { id: 'review', label: 'In review' },
  { id: 'done', label: 'Done' },
];

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const initialTasks = [
  { id: 'TRK-090', title: 'Design tokens audit', project: 'web', assignee: 'sofia', status: 'done', priority: 'medium', points: 3, due: '2026-09-14' },
  { id: 'TRK-101', title: 'Migrate billing webhooks to v2', project: 'billing', assignee: 'amara', status: 'progress', priority: 'high', points: 5, due: '2026-09-23' },
  { id: 'TRK-102', title: 'Idempotency keys for the refund endpoint', project: 'billing', assignee: 'amara', status: 'review', priority: 'urgent', points: 3, due: '2026-09-21' },
  { id: 'TRK-103', title: 'Invoice PDF shows the wrong currency symbol', project: 'billing', assignee: 'lucia', status: 'todo', priority: 'medium', points: 2, due: '2026-09-22' },
  { id: 'TRK-108', title: 'Rebuild the onboarding checklist', project: 'web', assignee: 'kenji', status: 'progress', priority: 'high', points: 8, due: '2026-09-25' },
  { id: 'TRK-109', title: 'Empty states for the project list', project: 'web', assignee: 'sofia', status: 'review', priority: 'low', points: 2, due: '2026-09-22' },
  { id: 'TRK-110', title: 'Keyboard navigation in the command palette', project: 'web', assignee: 'kenji', status: 'todo', priority: 'medium', points: 3, due: '2026-09-24' },
  { id: 'TRK-114', title: 'Offline queue for mobile check-ins', project: 'mobile', assignee: 'daniel', status: 'progress', priority: 'high', points: 8, due: '2026-09-25', blocked: 'Waiting on the final API contract' },
  { id: 'TRK-115', title: 'Crash on Android 13 during photo upload', project: 'mobile', assignee: 'daniel', status: 'todo', priority: 'urgent', points: 5, due: '2026-09-18' },
  { id: 'TRK-116', title: 'Push notification opt-in copy', project: 'mobile', assignee: 'sofia', status: 'done', priority: 'low', points: 1, due: '2026-09-16' },
  { id: 'TRK-120', title: 'Canary deploys for the search service', project: 'platform', assignee: 'tomas', status: 'progress', priority: 'high', points: 5, due: '2026-09-24' },
  { id: 'TRK-121', title: 'Rotate staging database credentials', project: 'platform', assignee: 'tomas', status: 'done', priority: 'medium', points: 2, due: '2026-09-15' },
  { id: 'TRK-122', title: 'Alert when p95 latency passes 800 ms', project: 'platform', assignee: 'tomas', status: 'todo', priority: 'medium', points: 3, due: '2026-09-25' },
  { id: 'TRK-127', title: 'Cohort retention query times out', project: 'data', assignee: 'hana', status: 'progress', priority: 'urgent', points: 5, due: '2026-09-21' },
  { id: 'TRK-128', title: 'Backfill events for schema v3', project: 'data', assignee: 'hana', status: 'review', priority: 'medium', points: 3, due: '2026-09-22' },
  { id: 'TRK-131', title: 'Regression suite for the checkout flow', project: 'billing', assignee: 'lucia', status: 'progress', priority: 'medium', points: 5, due: '2026-09-23' },
  { id: 'TRK-133', title: 'Write release notes for 24.9', project: 'web', assignee: 'priya', status: 'todo', priority: 'low', points: 1, due: '2026-09-25' },
];

// 10 working days. actual[i] = points remaining after i days are complete.
export const sprint = {
  name: 'Sprint 24',
  range: 'Sep 14 to Sep 25',
  scope: 64,
  totalDays: 10,
  dayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  actual: [64, 60, 55, 49, 44, 38],
};

export const activity = [
  { who: 'tomas', text: 'moved TRK-121 to Done', when: '2h ago' },
  { who: 'amara', text: 'requested review on TRK-102', when: '4h ago' },
  { who: 'daniel', text: 'flagged TRK-114 as blocked', when: 'Yesterday' },
  { who: 'lucia', text: 'opened TRK-103 from a support ticket', when: 'Yesterday' },
  { who: 'hana', text: 'started TRK-127', when: 'Fri' },
];
