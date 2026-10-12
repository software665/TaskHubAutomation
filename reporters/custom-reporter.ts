
import type {
  Reporter,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

import fs from 'node:fs';
import path from 'node:path';

type ReportStatus = 'Passed' | 'Failed' | 'Flaky' | 'Skipped';

interface ReportRow {
  id: string;
  module: string;
  testCase: string;
  browser: string;
  status: ReportStatus;
  duration: number;
  retries: number;
  error: string;
}

class CustomReporter implements Reporter {
  private tests: TestCase[] = [];
  private startTime = Date.now();
  private outputDir: string;

  constructor(options: { outputDir?: string } = {}) {
    this.outputDir = path.resolve(
      process.cwd(),
      options.outputDir || 'custom-report'
    );
  }

  printsToStdio(): boolean {
    return false;
  }

  onBegin(_config: unknown, suite: Suite): void {
    this.startTime = Date.now();
    this.tests = suite.allTests();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    console.log(
      `[QA Report] ${test.title}: ${result.status}`
    );
  }

  onEnd(result: FullResult): void {
    fs.mkdirSync(this.outputDir, { recursive: true });

    const rows: ReportRow[] = this.tests.map((test) => {
      const results = test.results;
      const last = results[results.length - 1];
      const outcome = test.outcome();

      let status: ReportStatus = 'Failed';

      if (outcome === 'expected') {
        status = 'Passed';
      } else if (outcome === 'flaky') {
        status = 'Flaky';
      } else if (outcome === 'skipped') {
        status = 'Skipped';
      }

      const errors = results.flatMap((r) => r.errors);
      const error = errors
        .map((e) => e.message || e.value || '')
        .filter(Boolean)
        .join('\n\n');

      const hierarchy = test.titlePath();
      const file = path.basename(test.location.file);

      return {
        id: test.id,
        module: file,
        testCase: hierarchy.slice(1).join(' > ') || test.title,
        browser: test.parent.project()?.name || 'unknown',
        status,
        duration: results.reduce(
          (total, r) => total + r.duration,
          0
        ),
        retries: last?.retry || 0,
        error,
      };
    });

    const summary = {
      total: rows.length,
      passed: rows.filter(r => r.status === 'Passed').length,
      failed: rows.filter(r => r.status === 'Failed').length,
      flaky: rows.filter(r => r.status === 'Flaky').length,
      skipped: rows.filter(r => r.status === 'Skipped').length,
      startTime: new Date(this.startTime).toISOString(),
      duration: Date.now() - this.startTime,
      executionStatus: result.status,
    };

    const report = { summary, tests: rows };

    fs.writeFileSync(
      path.join(this.outputDir, 'results.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    );

    const jsonForHtml = JSON.stringify(report)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QA Automation Report</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 30px;
      font-family: Arial, sans-serif;
      background: #f5f7fb;
      color: #172033;
    }
    .container { max-width: 1300px; margin: auto; }
    h1 { margin-bottom: 6px; }
    .sub { color: #64748b; margin-bottom: 25px; }
    .cards {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }
    .card {
      background: white;
      padding: 22px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }
    .card span { color: #64748b; font-size: 14px; }
    .card strong {
      display: block;
      font-size: 30px;
      margin-top: 10px;
    }
    .green { color: #16a34a; }
    .red { color: #dc2626; }
    .orange { color: #d97706; }
    .gray { color: #64748b; }
    .panel {
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-bottom: 20px;
    }
    .progress {
      display: flex;
      height: 12px;
      border-radius: 12px;
      overflow: hidden;
      background: #e2e8f0;
      margin-top: 15px;
    }
    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 15px;
    }
    input, select {
      padding: 11px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: white;
    }
    input { flex: 1; }
    .table-wrap { overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      padding: 14px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      vertical-align: top;
    }
    th { background: #f8fafc; }
    .status {
      font-weight: bold;
      border-radius: 6px;
    }
    .error {
      white-space: pre-wrap;
      max-width: 350px;
      max-height: 120px;
      overflow: auto;
      font-size: 12px;
      color: #b91c1c;
    }
    @media (max-width: 800px) {
      .cards { grid-template-columns: repeat(2, 1fr); }
      .filters { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>QA Automation Execution Report</h1>
    <div class="sub" id="metadata"></div>

    <div class="cards">
      <div class="card"><span>Total Tests</span><strong id="total"></strong></div>
      <div class="card"><span>Passed</span><strong class="green" id="passed"></strong></div>
      <div class="card"><span>Failed</span><strong class="red" id="failed"></strong></div>
      <div class="card"><span>Flaky</span><strong class="orange" id="flaky"></strong></div>
      <div class="card"><span>Skipped</span><strong class="gray" id="skipped"></strong></div>
    </div>

    <div class="panel">
      <h3>Execution Summary</h3>
      <div id="passRate"></div>
      <div class="progress" id="progress"></div>
    </div>

    <div class="panel">
      <h3>Test Case Details</h3>
      <div class="filters">
        <input id="search" placeholder="Search test case or module">
        <select id="statusFilter">
          <option value="">All Statuses</option>
          <option>Passed</option>
          <option>Failed</option>
          <option>Flaky</option>
          <option>Skipped</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Module</th>
              <th>Test Case</th>
              <th>Browser</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Retries</th>
              <th>Error Details</th>
            </tr>
          </thead>
          <tbody id="testRows"></tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    const report = ${jsonForHtml};
    const s = report.summary;
    const byId = id => document.getElementById(id);

    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    byId('metadata').textContent =
      'Executed: ' + new Date(s.startTime).toLocaleString() +
      ' | Duration: ' + (s.duration / 1000).toFixed(2) + 's' +
      ' | Run Status: ' + s.executionStatus;

    ['total','passed','failed','flaky','skipped']
      .forEach(key => byId(key).textContent = s[key]);

    const percentage = s.total
      ? (s.passed / s.total * 100).toFixed(1)
      : '0.0';

    byId('passRate').textContent = percentage + '% Passed';

    [
      ['passed', '#16a34a'],
      ['failed', '#dc2626'],
      ['flaky', '#d97706'],
      ['skipped', '#94a3b8']
    ].forEach(([key, color]) => {
      const segment = document.createElement('div');
      segment.style.width = (s.total ? s[key] / s.total * 100 : 0) + '%';
      segment.style.background = color;
      byId('progress').appendChild(segment);
    });

    function render() {
      const search = byId('search').value.toLowerCase();
      const status = byId('statusFilter').value;

      const filtered = report.tests.filter(t =>
        (!status || t.status === status) &&
        (t.testCase.toLowerCase().includes(search) ||
         t.module.toLowerCase().includes(search))
      );

      byId('testRows').innerHTML = filtered.map((t, i) => {
        const color =
          t.status === 'Passed' ? 'green' :
          t.status === 'Failed' ? 'red' :
          t.status === 'Flaky' ? 'orange' : 'gray';

        return '<tr>' +
          '<td>' + (i + 1) + '</td>' +
          '<td>' + escapeHtml(t.module) + '</td>' +
          '<td>' + escapeHtml(t.testCase) + '</td>' +
          '<td>' + escapeHtml(t.browser) + '</td>' +
          '<td class="status ' + color + '">' + t.status + '</td>' +
          '<td>' + (t.duration / 1000).toFixed(2) + 's</td>' +
          '<td>' + t.retries + '</td>' +
          '<td><div class="error">' + escapeHtml(t.error) + '</div></td>' +
          '</tr>';
      }).join('');
    }

    byId('search').addEventListener('input', render);
    byId('statusFilter').addEventListener('change', render);
    render();
  </script>
</body>
</html>`;

    fs.writeFileSync(
      path.join(this.outputDir, 'index.html'),
      html,
      'utf8'
    );

    console.log(
      `Custom QA report generated: ${this.outputDir}`
    );
  }
}

export default CustomReporter;
