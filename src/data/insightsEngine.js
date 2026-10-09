/* ---------------------------------------------------------------------------
 * Insights Engine — computes AI-style project health insights from pmoData
 * Used by AIInsightPanel and Projects pages
 * ------------------------------------------------------------------------- */
import { scoreHealth, healthGrade } from './pmoData';

const TODAY = '2026-10-08';
const TODAY_DATE = new Date(TODAY);

/**
 * Compute schedule performance for a project that has start/end dates.
 * Returns { timeElapsed, scheduleVariance, daysRemaining }
 */
function schedulePerf(proj, completionPct) {
  if (!proj.start || !proj.end)
    return { timeElapsed: null, scheduleVariance: null, daysRemaining: null };
  const startDate = new Date(proj.start);
  const endDate = new Date(proj.end);
  const totalDuration = endDate - startDate;
  const elapsed = TODAY_DATE - startDate;
  const timeElapsed = Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100)));
  const scheduleVariance = completionPct - timeElapsed;
  const msRemaining = endDate - TODAY_DATE;
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  return { timeElapsed, scheduleVariance, daysRemaining };
}

/**
 * Estimate projected completion date based on current velocity.
 */
function estimateCompletion(proj, hs) {
  if (!proj.start) return null;
  const startDate = new Date(proj.start);
  const msSinceStart = TODAY_DATE - startDate;
  if (msSinceStart <= 0 || hs.done === 0) return null;
  const tasksPerMs = hs.done / msSinceStart;
  const remaining = hs.N - hs.done;
  if (remaining <= 0) return 'Complete';
  const msToCompletion = remaining / tasksPerMs;
  const projected = new Date(TODAY_DATE.getTime() + msToCompletion);
  return projected.toISOString().slice(0, 10);
}

/**
 * Full insight report for a portfolio project (with task[].done, task[].due, task[].who).
 */
export function getProjectInsights(proj) {
  const hs = scoreHealth(proj.tasks || []);
  const grade = healthGrade(hs.v);
  const { timeElapsed, scheduleVariance, daysRemaining } = schedulePerf(proj, hs.cp);
  const projectedEnd = estimateCompletion(proj, hs);

  const goingWell = [];
  const concerns = [];
  const attention = [];
  const benchmarks = [];

  /* ── What's going well ── */
  if (hs.cp >= 70)
    goingWell.push(`Strong completion at ${hs.cp}% — ${hs.done} of ${hs.N} tasks done`);
  else if (hs.cp >= 50)
    goingWell.push(`Steady progress at ${hs.cp}% completion (${hs.done}/${hs.N} tasks)`);

  if (hs.ov === 0) goingWell.push('Zero overdue tasks — schedule is clean');

  if (hs.ua === 0 || hs.ua <= 1)
    goingWell.push('Accountability is strong — nearly all tasks have owners');

  if (scheduleVariance !== null && scheduleVariance > 5)
    goingWell.push(
      `Ahead of schedule by ${Math.abs(scheduleVariance)}% — ${timeElapsed}% of timeline elapsed, ${hs.cp}% of tasks done`
    );

  if (goingWell.length === 0) goingWell.push('Project is progressing as expected');

  /* ── Concerns ── */
  if (hs.ov >= 3)
    concerns.push(
      `${hs.ov} overdue tasks indicate systematic schedule risk — sprint re-planning advised`
    );
  else if (hs.ov > 0)
    concerns.push(`${hs.ov} overdue task${hs.ov > 1 ? 's' : ''} need immediate resolution`);

  if (hs.ua > 2)
    concerns.push(
      `${hs.ua} tasks lack ownership — creates accountability gaps and risks missed deliverables`
    );

  if (scheduleVariance !== null && scheduleVariance < -15)
    concerns.push(
      `Significantly behind schedule — ${Math.abs(scheduleVariance)}% gap (${timeElapsed}% time elapsed, ${hs.cp}% done)`
    );
  else if (scheduleVariance !== null && scheduleVariance < -5)
    concerns.push(
      `Slight schedule lag — ${Math.abs(scheduleVariance)}% behind pace (${timeElapsed}% elapsed, ${hs.cp}% done)`
    );

  if (daysRemaining !== null && daysRemaining < 14 && hs.cp < 80)
    concerns.push(
      `Only ${daysRemaining} days to deadline with ${100 - hs.cp}% of work remaining — high delivery risk`
    );

  if (daysRemaining !== null && daysRemaining < 0)
    concerns.push(`Project is ${Math.abs(daysRemaining)} days past its target end date`);

  if (concerns.length === 0) concerns.push('No critical concerns identified');

  /* ── Attention needed (actionable) ── */
  const overdueTasks = (proj.tasks || []).filter((t) => !t.done && t.due && t.due < TODAY);
  if (overdueTasks.length > 0) {
    const sample = overdueTasks
      .slice(0, 2)
      .map((t) => t.n)
      .join(', ');
    const more = overdueTasks.length > 2 ? ` (+${overdueTasks.length - 2} more)` : '';
    attention.push(`Unblock overdue tasks: ${sample}${more}`);
  }

  const unassigned = (proj.tasks || []).filter((t) => !t.done && !t.who);
  if (unassigned.length > 0) {
    const sample = unassigned
      .slice(0, 2)
      .map((t) => t.n)
      .join(', ');
    const more = unassigned.length > 2 ? `...` : '';
    attention.push(`Assign owners to ${unassigned.length} tasks: ${sample}${more}`);
  }

  if (daysRemaining !== null && daysRemaining < 21 && hs.cp < 80)
    attention.push(
      `Schedule a delivery review — ${daysRemaining} days left with ${100 - hs.cp}% to complete`
    );

  if (attention.length === 0) attention.push('No immediate actions required');

  /* ── Industry benchmarks ── */
  const type = proj.type || 'Operations';
  if (type === 'Research') {
    benchmarks.push(
      hs.cp >= 60
        ? '✓ On pace with research project benchmarks (60–80% mid-cycle completion rate)'
        : '⚠ Below typical research project pace — most achieve 60–80% completion by mid-cycle'
    );
    benchmarks.push(
      hs.ov <= 1
        ? '✓ Overdue task count within acceptable range for research timelines'
        : `⚠ ${hs.ov} overdue tasks exceeds the 1–2 acceptable for research studies`
    );
    if (daysRemaining !== null && daysRemaining > 0 && hs.cp < 90)
      benchmarks.push(
        'Research projects typically complete final analysis in the last 25% of timeline — plan accordingly'
      );
  } else if (type === 'Technology') {
    benchmarks.push(
      hs.v >= 70
        ? '✓ Health score above 70 meets technology project governance standards'
        : '⚠ Health score below 70 — technology projects at this stage typically require intervention'
    );
    benchmarks.push(
      'Technology projects: assign all tasks 2 weeks before sprint end to avoid scope creep'
    );
  } else {
    benchmarks.push(
      hs.cp >= 50
        ? '✓ Task completion rate meets standard operational project benchmarks'
        : '⚠ Completion rate below 50% — review capacity and blockers'
    );
  }

  return {
    name: proj.name,
    type,
    phase: proj.phase,
    score: hs.v,
    label: grade.label,
    color: grade.color,
    tag: grade.tag,
    completionPct: hs.cp,
    doneTasks: hs.done,
    totalTasks: hs.N,
    overdueTasks: hs.ov,
    unassignedTasks: hs.ua,
    timeElapsed,
    scheduleVariance,
    daysRemaining,
    projectedEnd,
    goingWell,
    concerns,
    attention,
    benchmarks,
  };
}

/**
 * Insights for a department project (budget-focused).
 */
export function getDeptProjectInsights(proj) {
  const col = proj.status;
  const pct = proj.budget ? Math.round((proj.spent / proj.budget) * 100) : null;
  const taskPct = proj.tasks.total > 0 ? Math.round((proj.tasks.done / proj.tasks.total) * 100) : 0;

  const goingWell = [];
  const concerns = [];
  const attention = [];
  const benchmarks = [];

  if (col === 'complete') goingWell.push('Project delivered successfully — all objectives met');
  if (col === 'green') goingWell.push('On track — delivery timeline and budget are aligned');
  if (pct !== null && pct < 75) goingWell.push(`Budget utilisation at ${pct}% — headroom remains`);
  if (proj.roi && proj.roi > 200)
    goingWell.push(`Exceptional ROI of ${proj.roi}% — outstanding value creation`);
  if (proj.savings)
    goingWell.push(`$${(proj.savings / 1000).toFixed(0)}K in confirmed/projected savings`);
  if (proj.tasks.overdue === 0) goingWell.push('Zero overdue tasks — execution is on schedule');
  if (goingWell.length === 0) goingWell.push('Project progressing within expected parameters');

  if (col === 'red') concerns.push('Off track — immediate executive attention required');
  if (col === 'yellow') concerns.push('At risk — schedule or budget pressure detected');
  if (pct !== null && pct > 90 && col !== 'complete')
    concerns.push(`Budget nearly exhausted at ${pct}% utilisation`);
  if (proj.tasks.overdue > 3)
    concerns.push(`${proj.tasks.overdue} overdue tasks signal systemic schedule risk`);
  if (concerns.length === 0) concerns.push('No critical financial or delivery concerns');

  if (proj.tasks.overdue > 0)
    attention.push(
      `Resolve ${proj.tasks.overdue} overdue task${proj.tasks.overdue > 1 ? 's' : ''} to unblock progress`
    );
  if (pct !== null && pct > 85 && col !== 'complete')
    attention.push('Request budget review — spend approaching ceiling');
  if (attention.length === 0) attention.push('Continue current execution cadence');

  if (proj.roi)
    benchmarks.push(
      proj.roi > 300
        ? `✓ ROI of ${proj.roi}% far exceeds the 200–300% typical for ${proj.cat} projects`
        : `✓ ROI of ${proj.roi}% meets ${proj.cat} project benchmarks`
    );
  if (pct !== null)
    benchmarks.push(
      pct <= 80
        ? `✓ ${pct}% budget utilisation is healthy — industry norm is 70–85% at this stage`
        : `⚠ ${pct}% spend rate is above the 70–85% industry norm for this project stage`
    );

  return {
    name: proj.name,
    status: proj.status,
    completionPct: taskPct,
    budgetPct: pct,
    goingWell,
    concerns,
    attention,
    benchmarks,
  };
}

/**
 * Portfolio-level insight summary (for PMO / Portfolios pages).
 */
export function getPortfolioInsights(portfolio) {
  const allTasks = portfolio.projects.flatMap((p) => p.tasks || []);
  const hs = scoreHealth(allTasks);
  const projectInsights = portfolio.projects.map((p) => getProjectInsights(p));

  const atRisk = projectInsights.filter((i) => i.score < 80 && i.score >= 60).length;
  const offTrack = projectInsights.filter((i) => i.score < 60).length;
  const onTrack = projectInsights.filter((i) => i.score >= 80).length;

  const topIssues = [];
  if (offTrack > 0)
    topIssues.push(
      `${offTrack} project${offTrack > 1 ? 's' : ''} off track — requires executive review`
    );
  if (atRisk > 0)
    topIssues.push(`${atRisk} project${atRisk > 1 ? 's' : ''} at risk — monitor closely`);
  if (hs.ov > 5)
    topIssues.push(`${hs.ov} total overdue tasks across portfolio — capacity review recommended`);
  if (topIssues.length === 0) topIssues.push('Portfolio health is within acceptable parameters');

  return { onTrack, atRisk, offTrack, topIssues, avgScore: hs.v, projectInsights };
}
