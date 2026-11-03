import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowDown,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  Plus,
  RotateCcw,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import {
  createStarterData,
  readAcademyData,
  toggleCompletion,
  writeAcademyData,
  type AcademyData,
  type Assignment,
} from "./academyData";

type Role = "student" | "teacher";
type AssignmentDraft = Omit<Assignment, "id">;

const today = new Date();
const subjectClass: Record<string, string> = {
  Math: "math",
  Reading: "reading",
  Science: "science",
  "Social Studies": "social-studies",
};

function formatDueDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(parsed);
}

function isOverdue(date: string) {
  return new Date(`${date}T23:59:59`) < today;
}

function App() {
  const [initial] = useState(() => {
    try {
      return { data: readAcademyData(), error: "" };
    } catch (error) {
      return {
        data: createStarterData(),
        error: error instanceof Error ? error.message : "Saved classroom data could not be loaded.",
      };
    }
  });
  const [data, setData] = useState<AcademyData>(initial.data);
  const [storageError, setStorageError] = useState(initial.error);
  const [role, setRole] = useState<Role>("student");
  const [studentId, setStudentId] = useState(initial.data.students[0]?.id ?? "");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [persistChanges, setPersistChanges] = useState(false);

  useEffect(() => {
    if (!persistChanges) return;
    try {
      writeAcademyData(data);
      setStorageError("");
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "Changes could not be saved.");
    }
  }, [data, persistChanges]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const student = data.students.find((person) => person.id === studentId) ?? data.students[0];
  const completedForStudent = data.completions[student?.id ?? ""] ?? [];

  const classStats = useMemo(() => {
    const total = data.assignments.length * data.students.length;
    const completed = data.students.reduce(
      (sum, person) =>
        sum +
        (data.completions[person.id] ?? []).filter((id) =>
          data.assignments.some((assignment) => assignment.id === id),
        ).length,
      0,
    );
    return { total, completed, rate: total ? Math.round((completed / total) * 100) : 0 };
  }, [data]);

  function commitData(nextData: AcademyData | ((current: AcademyData) => AcademyData)) {
    setData(nextData);
    setPersistChanges(true);
  }

  function updateCompletion(assignmentId: string) {
    if (!student) return;
    const wasComplete = completedForStudent.includes(assignmentId);
    commitData((current) => ({
      ...current,
      completions: toggleCompletion(current.completions, student.id, assignmentId),
    }));
    setToast(wasComplete ? "Assignment moved back to your list." : "Lovely work — marked complete!");
  }

  function openCreateForm() {
    setEditingId(null);
    setIsFormOpen(true);
  }

  function openEditForm(assignmentId: string) {
    setEditingId(assignmentId);
    setIsFormOpen(true);
  }

  function saveAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const assignment: AssignmentDraft = {
      title: String(formData.get("title")).trim(),
      subject: String(formData.get("subject")),
      description: String(formData.get("description")).trim(),
      dueDate: String(formData.get("dueDate")),
      points: Number(formData.get("points")),
    };
    if (!assignment.title || !assignment.dueDate || !Number.isFinite(assignment.points)) return;

    if (editingId) {
      commitData((current) => ({
        ...current,
        assignments: current.assignments.map((item) =>
          item.id === editingId ? { ...assignment, id: editingId } : item,
        ),
      }));
      setToast("Assignment updated.");
    } else {
      const newId = `assignment-${crypto.randomUUID()}`;
      commitData((current) => ({
        ...current,
        assignments: [...current.assignments, { ...assignment, id: newId }],
        completions: Object.fromEntries(
          current.students.map((person) => [person.id, current.completions[person.id] ?? []]),
        ),
      }));
      setToast("New assignment added.");
    }
    setIsFormOpen(false);
  }

  function deleteAssignment(assignmentId: string) {
    const assignment = data.assignments.find((item) => item.id === assignmentId);
    if (!assignment || !window.confirm(`Delete "${assignment.title}" for the whole class?`)) return;
    commitData((current) => ({
      ...current,
      assignments: current.assignments.filter((item) => item.id !== assignmentId),
      completions: Object.fromEntries(
        Object.entries(current.completions).map(([id, completedIds]) => [
          id,
          completedIds.filter((idToKeep) => idToKeep !== assignmentId),
        ]),
      ),
    }));
    setToast("Assignment deleted.");
  }

  function resetClassroom() {
    if (!window.confirm("Restore the starter assignments and classroom progress? Your local changes will be removed.")) {
      return;
    }
    const freshData = createStarterData();
    commitData(freshData);
    setStudentId(freshData.students[0].id);
    setToast("Starter classroom restored.");
  }

  const activeAssignment = data.assignments.find((assignment) => assignment.id === editingId);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Royal Minds Academy home">
          <span className="brand-mark"><Sparkles size={21} strokeWidth={2.2} /></span>
          <span className="brand-copy">
            <strong>Royal Minds</strong>
            <small>ACADEMY</small>
          </span>
        </a>
        <div className="topbar-right">
          <div className="role-switch" aria-label="Choose demo role">
            <button
              className={role === "student" ? "role-option selected" : "role-option"}
              aria-pressed={role === "student"}
              onClick={() => setRole("student")}
              type="button"
            >
              <GraduationCap size={16} /> Student
            </button>
            <button
              className={role === "teacher" ? "role-option selected" : "role-option"}
              aria-pressed={role === "teacher"}
              onClick={() => setRole("teacher")}
              type="button"
            >
              <UsersRound size={16} /> Teacher
            </button>
          </div>
          <button className="icon-button help-button" aria-label="Demo app information" type="button" onClick={() => setToast("Demo mode — changes are saved in this browser only.")}>
            <CircleHelp size={19} />
          </button>
          <span className="topbar-divider" />
          <div className="profile-summary">
            <span className={`avatar avatar-${role === "teacher" ? "teacher" : student?.color ?? "coral"}`}>
              {role === "teacher" ? "AM" : student?.initials ?? "ST"}
            </span>
            <span className="profile-copy">
              <strong>{role === "teacher" ? "Ms. Anderson" : student?.name ?? "Student"}</strong>
              <small>{role === "teacher" ? "Teacher" : "Grade 5"}</small>
            </span>
            <ChevronDown size={15} className="profile-chevron" />
          </div>
        </div>
      </header>

      <div className="page-layout">
        <aside className="sidebar">
          <div className="school-label">CLASSROOM</div>
          <nav className="side-nav" aria-label="Main navigation">
            <button className="nav-item active" type="button">
              {role === "teacher" ? <LayoutDashboard size={18} /> : <BookOpen size={18} />}
              <span>{role === "teacher" ? "Overview" : "My assignments"}</span>
            </button>
            {role === "teacher" && (
              <button className="nav-item" type="button" onClick={() => document.getElementById("class-progress")?.scrollIntoView({ behavior: "smooth" })}>
                <UsersRound size={18} /><span>Class progress</span>
              </button>
            )}
          </nav>
          <div className="sidebar-note">
            <span className="note-icon"><Sparkles size={17} /></span>
            <strong>{role === "teacher" ? "Little steps add up" : "You’ve got this!"}</strong>
            <p>{role === "teacher" ? "Every learner grows at their own pace." : "Keep showing up and doing your best."}</p>
            <div className="note-decoration" aria-hidden="true">✦ &nbsp;·&nbsp; ✦</div>
          </div>
          <div className="sidebar-bottom">
            <span className="term-dot" />
            <span>2026–27 School Year</span>
          </div>
        </aside>

        <main className="main-content">
          {storageError && (
            <div className="storage-alert" role="alert">
              <span>{storageError} Your changes may not persist.</span>
              <button type="button" onClick={resetClassroom}>Restore starter data</button>
            </div>
          )}
          {role === "student" && student ? (
            <StudentView
              student={student}
              students={data.students}
              assignments={data.assignments}
              completedIds={completedForStudent}
              onStudentChange={setStudentId}
              onToggleCompletion={updateCompletion}
            />
          ) : (
            <TeacherView
              data={data}
              stats={classStats}
              onCreate={openCreateForm}
              onEdit={openEditForm}
              onDelete={deleteAssignment}
              onReset={resetClassroom}
            />
          )}
        </main>
      </div>

      {isFormOpen && (
        <AssignmentForm
          assignment={activeAssignment}
          onClose={() => setIsFormOpen(false)}
          onSubmit={saveAssignment}
        />
      )}
      {toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  );
}

type StudentViewProps = {
  student: AcademyData["students"][number];
  students: AcademyData["students"];
  assignments: Assignment[];
  completedIds: string[];
  onStudentChange: (id: string) => void;
  onToggleCompletion: (id: string) => void;
};

function StudentView({
  student,
  students,
  assignments,
  completedIds,
  onStudentChange,
  onToggleCompletion,
}: StudentViewProps) {
  const pending = assignments.filter((assignment) => !completedIds.includes(assignment.id));
  const completed = assignments.filter((assignment) => completedIds.includes(assignment.id));
  const progress = assignments.length ? Math.round((completed.length / assignments.length) * 100) : 0;

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-star">✦</span> YOUR LEARNING SPACE</div>
          <h1>Good morning, {student.name.split(" ")[0]} <span className="wave">✦</span></h1>
          <p className="page-subtitle">A new day is a new chance to learn something wonderful.</p>
        </div>
        <label className="student-picker">
          <span>Demo student</span>
          <select value={student.id} onChange={(event) => onStudentChange(event.target.value)} aria-label="Choose demo student">
            {students.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
          <ChevronDown size={15} />
        </label>
      </div>

      <section className="student-hero">
        <div className="hero-text">
          <span className="hero-label">YOUR WEEKLY JOURNEY</span>
          <h2>Look how far you’ve come!</h2>
          <p>Every assignment you finish is a little win worth celebrating.</p>
          <div className="progress-caption">
            <span>{completed.length} of {assignments.length} assignments complete</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track" role="progressbar" aria-label="Weekly assignments completed" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <div className="sun-shape" />
          <div className="book-shape book-one" />
          <div className="book-shape book-two" />
          <div className="hero-spark hero-spark-one">✦</div>
          <div className="hero-spark hero-spark-two">✧</div>
          <div className="hero-pencil">✎</div>
        </div>
      </section>

      <div className="section-heading">
        <div>
          <h2>Ready when you are</h2>
          <p>Your assignments are here. Take them one at a time.</p>
        </div>
        <span className="count-pill">{pending.length} to do</span>
      </div>

      {pending.length ? (
        <div className="assignment-grid">
          {pending.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              complete={false}
              onToggle={() => onToggleCompletion(assignment.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon"><CheckCircle2 size={27} /></span>
          <h3>All caught up — amazing work!</h3>
          <p>There are no assignments waiting for you right now.</p>
        </div>
      )}

      {completed.length > 0 && (
        <section className="completed-section">
          <div className="section-heading compact-heading">
            <div><h2>Look at you go</h2><p>Completed assignments</p></div>
            <span className="completed-count"><Check size={14} /> {completed.length} done</span>
          </div>
          <div className="completed-list">
            {completed.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                complete
                onToggle={() => onToggleCompletion(assignment.id)}
              />
            ))}
          </div>
        </section>
      )}
      <footer className="page-footer">Keep being curious. You’re doing great! <span>✦</span></footer>
    </>
  );
}

function AssignmentCard({
  assignment,
  complete,
  onToggle,
}: {
  assignment: Assignment;
  complete: boolean;
  onToggle: () => void;
}) {
  const due = isOverdue(assignment.dueDate);
  const className = subjectClass[assignment.subject] ?? "other";

  return (
    <article className={complete ? "assignment-card is-complete" : "assignment-card"}>
      <div className={`subject-icon subject-${className}`}>
        {assignment.subject === "Math" ? <Sparkles size={19} /> :
          assignment.subject === "Reading" ? <BookOpen size={19} /> :
            assignment.subject === "Science" ? <Sparkles size={19} /> : <UsersRound size={19} />}
      </div>
      <div className="assignment-content">
        <div className="assignment-meta">
          <span className={`subject-tag tag-${className}`}>{assignment.subject}</span>
          <span className={due && !complete ? "due-date overdue" : "due-date"}>
            {complete ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
            {complete ? "Completed" : `${due ? "Was due" : "Due"} ${formatDueDate(assignment.dueDate)}`}
          </span>
        </div>
        <h3>{assignment.title}</h3>
        <p>{assignment.description}</p>
        <div className="assignment-bottom">
          <span className="points-label"><Sparkles size={14} /> {assignment.points} points</span>
          <button
            className={complete ? "complete-button done-button" : "complete-button"}
            type="button"
            onClick={onToggle}
          >
            {complete ? <><Check size={15} /> Done</> : <>Mark complete <ArrowDown size={14} /></>}
          </button>
        </div>
      </div>
    </article>
  );
}

type TeacherViewProps = {
  data: AcademyData;
  stats: { total: number; completed: number; rate: number };
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
};

function TeacherView({ data, stats, onCreate, onEdit, onDelete, onReset }: TeacherViewProps) {
  const [sortBy, setSortBy] = useState<"name" | "progress">("name");
  const sortedStudents = [...data.students].sort((a, b) => {
    if (sortBy === "progress") {
      const aProgress = data.assignments.filter((item) => (data.completions[a.id] ?? []).includes(item.id)).length;
      const bProgress = data.assignments.filter((item) => (data.completions[b.id] ?? []).includes(item.id)).length;
      return bProgress - aProgress || a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <div className="welcome-row teacher-welcome">
        <div>
          <div className="eyebrow"><span className="eyebrow-star">✦</span> TEACHER WORKSPACE</div>
          <h1>Your classroom, at a glance</h1>
          <p className="page-subtitle">A little progress each day adds up to big results.</p>
        </div>
        <button className="primary-button" type="button" onClick={onCreate}><Plus size={18} /> New assignment</button>
      </div>

      <section className="teacher-stats" aria-label="Class summary">
        <div className="stat-card">
          <span className="stat-icon stat-violet"><ClipboardList size={20} /></span>
          <span className="stat-label">Active assignments</span>
          <strong>{data.assignments.length}</strong>
          <small>For your class</small>
        </div>
        <div className="stat-card">
          <span className="stat-icon stat-blue"><UsersRound size={20} /></span>
          <span className="stat-label">Learners</span>
          <strong>{data.students.length}</strong>
          <small>In your classroom</small>
        </div>
        <div className="stat-card">
          <span className="stat-icon stat-green"><CheckCircle2 size={20} /></span>
          <span className="stat-label">Completed work</span>
          <strong>{stats.completed}<span className="stat-total"> / {stats.total}</span></strong>
          <small>Across all assignments</small>
        </div>
        <div className="stat-card">
          <span className="stat-icon stat-coral"><Sparkles size={20} /></span>
          <span className="stat-label">Class completion</span>
          <strong>{stats.rate}<span className="stat-percent">%</span></strong>
          <small>Keep up the great work!</small>
        </div>
      </section>

      <section className="teacher-section" id="class-progress">
        <div className="section-heading teacher-section-heading">
          <div>
            <h2>Class progress</h2>
            <p>See how each learner is moving through their work.</p>
          </div>
          <label className="sort-control">
            <span>Sort by</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "name" | "progress")}>
              <option value="name">Student name</option>
              <option value="progress">Most complete</option>
            </select>
            <ChevronDown size={15} />
          </label>
        </div>
        <div className="progress-table-wrap">
          <table className="progress-table">
            <thead>
              <tr><th scope="col">STUDENT</th><th scope="col">ASSIGNMENTS DONE</th><th scope="col">PROGRESS</th><th scope="col">STATUS</th></tr>
            </thead>
            <tbody>
              {sortedStudents.map((person) => {
                const count = data.assignments.filter((assignment) =>
                  (data.completions[person.id] ?? []).includes(assignment.id),
                ).length;
                const percentage = data.assignments.length ? Math.round((count / data.assignments.length) * 100) : 0;
                return (
                  <tr key={person.id}>
                    <td>
                      <div className="table-student">
                        <span className={`avatar avatar-${person.color}`}>{person.initials}</span>
                        <span><strong>{person.name}</strong><small>{person.grade}</small></span>
                      </div>
                    </td>
                    <td><span className="done-fraction">{count}<span> / {data.assignments.length}</span></span></td>
                    <td>
                      <div className="table-progress"><div className="table-track"><div style={{ width: `${percentage}%` }} /></div><span>{percentage}%</span></div>
                    </td>
                    <td><span className={percentage === 100 ? "activity activity-done" : "activity"}>{percentage === 100 ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}{percentage === 100 ? "All caught up" : `${data.assignments.length - count} still to do`}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.students.length === 0 && <div className="table-empty">No demo learners are available.</div>}
        </div>
      </section>

      <section className="teacher-section assignments-management">
        <div className="section-heading teacher-section-heading">
          <div><h2>Assignments</h2><p>Create a little challenge for your class.</p></div>
          <button className="text-button" type="button" onClick={onReset}><RotateCcw size={15} /> Restore demo data</button>
        </div>
        <div className="management-list">
          {data.assignments.map((assignment) => {
            const completed = data.students.filter((person) => (data.completions[person.id] ?? []).includes(assignment.id)).length;
            return (
              <article className="management-row" key={assignment.id}>
                <span className={`subject-icon small-subject subject-${subjectClass[assignment.subject] ?? "other"}`}>
                  {assignment.subject === "Math" ? <Sparkles size={17} /> : assignment.subject === "Reading" ? <BookOpen size={17} /> : <GraduationCap size={17} />}
                </span>
                <div className="management-title"><strong>{assignment.title}</strong><span>{assignment.subject} · Due {formatDueDate(assignment.dueDate)}</span></div>
                <div className="management-completion"><span>{completed} of {data.students.length} done</span><div className="mini-track"><div style={{ width: `${data.students.length ? completed / data.students.length * 100 : 0}%` }} /></div></div>
                <div className="row-actions">
                  <button type="button" aria-label={`Edit ${assignment.title}`} onClick={() => onEdit(assignment.id)}>Edit</button>
                  <button className="delete-action" type="button" aria-label={`Delete ${assignment.title}`} onClick={() => onDelete(assignment.id)}>Delete</button>
                </div>
              </article>
            );
          })}
          {data.assignments.length === 0 && <div className="table-empty">No assignments yet. Add one to get started.</div>}
        </div>
      </section>
      <footer className="page-footer">Small steps. Bright futures. <span>✦</span></footer>
    </>
  );
}

function AssignmentForm({
  assignment,
  onClose,
  onSubmit,
}: {
  assignment?: Assignment;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="assignment-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div><span className="modal-kicker">CLASSROOM ASSIGNMENT</span><h2 id="modal-title">{assignment ? "Edit assignment" : "Create an assignment"}</h2></div>
          <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="modal-subtitle">Make it clear, encouraging, and just right for your learners.</p>
        <form onSubmit={onSubmit}>
          <label className="form-field">
            <span>Assignment title</span>
            <input name="title" required maxLength={70} defaultValue={assignment?.title ?? ""} placeholder="e.g. Fraction detectives" autoFocus />
          </label>
          <div className="form-row">
            <label className="form-field">
              <span>Subject</span>
              <select name="subject" defaultValue={assignment?.subject ?? "Math"}>
                <option>Math</option><option>Reading</option><option>Science</option><option>Social Studies</option>
              </select>
            </label>
            <label className="form-field">
              <span>Due date</span>
              <input name="dueDate" type="date" required defaultValue={assignment?.dueDate ?? ""} />
            </label>
          </div>
          <label className="form-field">
            <span>Instructions</span>
            <textarea name="description" rows={3} maxLength={240} placeholder="What should students do?" defaultValue={assignment?.description ?? ""} />
          </label>
          <label className="form-field points-field">
            <span>Points</span>
            <input name="points" type="number" min="0" max="1000" required defaultValue={assignment?.points ?? 10} />
          </label>
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button" type="submit">{assignment ? <><Check size={16} /> Save changes</> : <><Plus size={17} /> Create assignment</>}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default App;
