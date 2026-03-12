const REPO = "Perceptshun/mission-control";
const FILE = "board.md";
const API_BASE = "https://api.github.com";

export function getToken(): string | null {
  try {
    return localStorage.getItem("gh_token");
  } catch (e) {
    console.error("Failed to read token from localStorage:", e);
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem("gh_token", token);
  } catch (e) {
    console.error("Failed to save token to localStorage:", e);
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem("gh_token");
  } catch (e) {
    console.error("Failed to clear token from localStorage:", e);
  }
}

export async function fetchBoardMd(): Promise<{
  content: string;
  sha: string;
}> {
  const token = getToken();
  if (!token) throw new Error("GitHub token not set");

  const url = `${API_BASE}/repos/${REPO}/contents/${FILE}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3.raw",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch board.md: ${response.status} ${response.statusText}`
    );
  }

  // Get raw content
  const content = await response.text();

  // Get SHA from metadata endpoint
  const metaResponse = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!metaResponse.ok) {
    throw new Error(
      `GitHub API error ${metaResponse.status}: ${metaResponse.statusText}. Check that your token is valid.`
    );
  }

  const meta = await metaResponse.json();
  return { content, sha: meta.sha };
}

export async function saveBoardMd(
  content: string,
  sha: string,
  message: string
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("GitHub token not set");

  // Refetch to ensure we have the latest SHA to prevent conflicts
  const { sha: latestSha } = await fetchBoardMd();

  const url = `${API_BASE}/repos/${REPO}/contents/${FILE}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      sha: latestSha,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to save board.md: ${response.status} ${response.statusText}`
    );
  }
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: string
): Promise<void> {
  const { content, sha } = await fetchBoardMd();

  // Find and replace status for task
  const lines = content.split("\n");
  let taskFound = false;
  let statusIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`id: ${taskId}`)) {
      taskFound = true;
    }

    if (
      taskFound &&
      lines[i].startsWith("status:") &&
      statusIdx === -1
    ) {
      statusIdx = i;
      break;
    }
  }

  if (statusIdx === -1) {
    throw new Error(`Task ${taskId} not found or status line missing`);
  }

  lines[statusIdx] = `status: ${newStatus}`;
  const updated = lines.join("\n");

  await saveBoardMd(
    updated,
    sha,
    `chore: update task ${taskId} status to ${newStatus}`
  );
}

export async function deleteTask(taskId: string): Promise<void> {
  const { content, sha } = await fetchBoardMd();

  const blocks = content.split(/\n---\n/);
  const filtered = blocks.filter((block) => !block.includes(`id: ${taskId}`));

  if (filtered.length === blocks.length) {
    throw new Error(`Task ${taskId} not found`);
  }

  const updated = filtered.join("\n---\n");

  await saveBoardMd(updated, sha, `chore: delete task ${taskId}`);
}
