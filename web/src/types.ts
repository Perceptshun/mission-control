export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "backlog" | "in_progress" | "in_review" | "done";
  priority: "high" | "medium" | "low";
  assigned_to: "one" | "jd";
  due_date?: string;
  created_at: string;
  completed_at?: string;
  tags: string[];
  estimate_hours?: number;
  actual_hours?: number;
}
