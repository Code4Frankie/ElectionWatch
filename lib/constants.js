export const CATEGORIES = {
  violence: 'Violence', vote_buying: 'Vote buying', ballot_snatching: 'Ballot snatching',
  intimidation: 'Intimidation', late_opening: 'Late opening', result_tampering: 'Result tampering',
  voter_suppression: 'Voter suppression', equipment_failure: 'Equipment failure',
  logistics: 'Logistics', other: 'Other',
};
export const SEVERITIES = ['low', 'medium', 'high', 'critical'];
export const STATUSES = ['new', 'under_review', 'verified', 'escalated', 'resolved', 'rejected'];
export const TRANSITIONS = {
  new: ['under_review', 'rejected'], under_review: ['verified', 'rejected', 'escalated'],
  verified: ['escalated', 'resolved'], escalated: ['resolved'], rejected: [], resolved: [],
};
export const label = (s) => (s || '').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
