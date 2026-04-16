import { mkdir, appendFile } from 'fs/promises';
import path from 'path';
import { Page, TestInfo } from '@playwright/test';

function sanitizeFileName(value: string): string {
  return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, '_');
}

function getKstTimestampForFile(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${partMap.year}${partMap.month}${partMap.day}-${partMap.hour}${partMap.minute}${partMap.second}`;
}

function getKstTimestampForLog(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}:${partMap.second}+09:00`;
}

function getReportDirectory(): string {
  const runId = process.env.PW_SCENARIO_RUN_ID ?? 'manual-run';
  return path.resolve(process.cwd(), 'test-results', 'scenario-results', runId);
}

export async function saveScenarioReport(page: Page, testInfo: TestInfo): Promise<void> {
  const reportDirectory = getReportDirectory();
  await mkdir(reportDirectory, { recursive: true });

  const scenarioTitle = testInfo.title;
  const scenarioStatus = testInfo.status;
  const safeScenarioTitle = sanitizeFileName(scenarioTitle);
  const screenshotTimestamp = getKstTimestampForFile();
  const screenshotFileName = `${screenshotTimestamp}-${scenarioStatus}-${safeScenarioTitle}.png`;
  const screenshotPath = path.join(reportDirectory, screenshotFileName);
  const screenshotRelativePath = path.join('scenario-results', process.env.PW_SCENARIO_RUN_ID ?? 'manual-run', screenshotFileName);
  const logPath = path.join(reportDirectory, 'log.txt');
  const timestamp = getKstTimestampForLog();
  const expectedStatus = testInfo.expectedStatus;
  const projectName = testInfo.project.name;
  const browserName = String(testInfo.project.use.browserName ?? 'unknown');
  const durationMs = testInfo.duration;
  const errorMessage = testInfo.error?.message?.split('\n')[0] ?? 'none';

  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } catch (error) {
    const screenshotFailLog = `[${timestamp}] project=${projectName} browser=${browserName} duration_ms=${durationMs} status=${scenarioStatus} expected=${expectedStatus} title="${scenarioTitle}" screenshot=FAILED reason="screenshot capture failed" error="${errorMessage}"\n`;
    await appendFile(logPath, screenshotFailLog, 'utf8');
    return;
  }

  const logLine = `[${timestamp}] project=${projectName} browser=${browserName} duration_ms=${durationMs} status=${scenarioStatus} expected=${expectedStatus} title="${scenarioTitle}" screenshot="${screenshotRelativePath}" error="${errorMessage}"\n`;
  await appendFile(logPath, logLine, 'utf8');
}
