import { apiGet, AttemptItem, TaskItem } from "@/lib/api";

export default async function TasksPage() {
  const tasks = await apiGet<TaskItem[]>('/api/tasks').catch(() => []);

  return (
    <main className="container">
      <section className="panel">
        <h1>Service Tasks</h1>
        <p className="subtitle">送达任务与尝试记录</p>
        <div className="card-list">
          {tasks.map((t) => (
            <TaskRow task={t} key={t.id} />
          ))}
          {tasks.length === 0 && <div className="card-row"><span>No tasks yet.</span></div>}
        </div>
      </section>
    </main>
  );
}

async function TaskRow({ task }: { task: TaskItem }) {
  const attempts = await apiGet<AttemptItem[]>(`/api/channels/tasks/${task.id}/attempts`).catch(() => []);

  return (
    <div className="card-row" style={{ display: "block" }}>
      <div><strong>{task.taskNo}</strong> / {task.docType} / {task.currentStatus}</div>
      <div className="subtitle">{task.partyName} - deadline: {task.legalDeadlineAt}</div>
      <div className="subtitle">Attempts: {attempts.length}</div>
    </div>
  );
}
