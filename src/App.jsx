import { useEffect, useRef, useState } from "react"

export default function App() {
  /* ---------------- DATE ---------------- */
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const date = today.getDate()
  const monthKey = `${year}-${month}`
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  /* ---------------- TASK STATE ---------------- */
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(`tasks-${monthKey}`)
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    localStorage.setItem(`tasks-${monthKey}`, JSON.stringify(tasks))
  }, [tasks, monthKey])

  const saveTask = (day) => {
    if (!tasks[day]?.text) return
    setTasks({
      ...tasks,
      [day]: { ...tasks[day], saved: true, done: false },
    })
  }

  const updateTaskText = (day, text) => {
    if (tasks[day]?.saved) return
    setTasks({
      ...tasks,
      [day]: { text, saved: false, done: false },
    })
  }

  const markComplete = (day) => {
    if (day !== date) return
    setTasks({
      ...tasks,
      [day]: { ...tasks[day], done: true },
    })
    setShowCongrats(true)
  }

  /* ---------------- ANALYTICS ---------------- */
  const completedDays = Object.values(tasks).filter((t) => t.done).length
  const progress = Math.round((completedDays / daysInMonth) * 100)

  const streak = (() => {
    let s = 0
    for (let d = date; d >= 1; d--) {
      if (tasks[d]?.done) s++
      else break
    }
    return s
  })()

  /* ---------------- MODALS ---------------- */
  const [helpOpen, setHelpOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)

  /* ---------------- POMODORO ---------------- */
  const [pomoTime, setPomoTime] = useState(30 * 60)
  const [pomoRun, setPomoRun] = useState(false)
  const pomoRef = useRef(null)
  const bellRef = useRef(null)

  useEffect(() => {
    if (pomoRun) {
      pomoRef.current = setInterval(() => {
        setPomoTime((t) => {
          if (t <= 1) {
            bellRef.current.play()
            setPomoRun(false)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(pomoRef.current)
  }, [pomoRun])

  const format = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
      s % 60
    ).padStart(2, "0")}`

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">

      <audio
        ref={bellRef}
        src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"
      />

      {/* NAVBAR */}
      <nav className="px-8 py-5 flex justify-between items-center bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <h1 className="text-xl font-extrabold text-sky-400">
          Serious Study Series
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => setHelpOpen(true)}
            className="px-6 py-2 rounded bg-slate-700 text-sm"
          >
            Help
          </button>
          <button
            onClick={() => setAboutOpen(true)}
            className="px-6 py-2 rounded bg-slate-700 text-sm"
          >
            About
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent tracking-widest">
            SERIOUS STUDY SERIES
          </h2>
          <p className="text-slate-400 mt-2">Accountancy</p>
          <p className="text-xs text-slate-500 mt-1">
            Today: {today.toDateString()}
          </p>
        </div>

        {/* ANALYTICS */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-400">Overall Progress</p>
            <div className="mt-3 h-3 bg-slate-800 rounded-full">
              <div
                className="h-3 bg-sky-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm">{progress}% completed</p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-400">Daily Streak</p>
            <p className="text-3xl font-bold mt-2">🔥 {streak} days</p>
          </div>
        </div>

        {/* POMODORO */}
        <div className="mb-10 bg-slate-900/70 border border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold text-sky-300 mb-3">Pomodoro</h3>
          <div className="text-4xl font-bold text-center mb-4">
            {format(pomoTime)}
          </div>
          <div className="flex justify-center gap-2 mb-3">
            {[30, 45, 60, 90].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setPomoRun(false)
                  setPomoTime(m * 60)
                }}
                className="px-4 py-2 rounded bg-slate-800"
              >
                {m} min
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setPomoRun(true)}
              className="px-6 py-2 bg-sky-600 rounded"
            >
              Start
            </button>
            <button
              onClick={() => setPomoRun(false)}
              className="px-6 py-2 bg-slate-700 rounded"
            >
              Pause
            </button>
          </div>
        </div>

        {/* DAILY PLANNER */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-sky-300 mb-6">
            Daily Planner –{" "}
            {today.toLocaleString("default", { month: "long" })}
          </h3>

          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1
            const task = tasks[d] || {}

            return (
              <div
                key={d}
                className="flex items-center gap-4 mb-4 border-b border-slate-800 pb-4"
              >
                <div className="w-16 font-bold text-slate-300">
                  Day {d}
                </div>

                <input
                  value={task.text || ""}
                  disabled={task.saved}
                  onChange={(e) => updateTaskText(d, e.target.value)}
                  placeholder="Write task..."
                  className={`flex-1 p-2 rounded border ${
                    task.saved
                      ? "bg-slate-800 border-slate-700 text-slate-400"
                      : "bg-slate-900 border-slate-800"
                  }`}
                />

                {!task.saved && (
                  <button
                    onClick={() => saveTask(d)}
                    className="px-4 py-2 bg-sky-700 rounded"
                  >
                    Save
                  </button>
                )}

                {task.saved && d === date && !task.done && (
                  <button
                    onClick={() => markComplete(d)}
                    className="px-4 py-2 bg-green-700 rounded"
                  >
                    Complete
                  </button>
                )}

                {task.done && (
                  <span className="text-sky-400 text-sm">✔ Done</span>
                )}
              </div>
            )
          })}
        </div>
      </main>

      {/* MODALS */}
      {(helpOpen || aboutOpen || showCongrats) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-xl max-h-[80vh] overflow-y-auto">
            {helpOpen && (
              <>
                <h3 className="text-xl font-bold mb-4">Help</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  • Plan tasks for the entire month anytime<br />
                  • Saving a task locks it permanently<br />
                  • Only today’s task can be completed<br />
                  • Progress and streaks are automatic<br />
                  • This system is designed to prevent cheating
                </p>
              </>
            )}

            {aboutOpen && (
              <>
                <h3 className="text-xl font-bold mb-4">About</h3>
                <p className="text-slate-400 text-sm">
                  Serious Study Series is a discipline-first
                  study system.<br /><br />
                  Made by <b>Mr. Piyush Pandey</b><br />
                  For accountable and consistent exam preparation.
                </p>
              </>
            )}

            {showCongrats && (
              <>
                <h3 className="text-xl font-bold mb-4">
                  🎉 Congratulations
                </h3>
                <p className="text-slate-400 text-sm">
                  You completed today’s task. Stay consistent.
                </p>
              </>
            )}

            <button
              onClick={() => {
                setHelpOpen(false)
                setAboutOpen(false)
                setShowCongrats(false)
              }}
              className="mt-6 px-6 py-2 bg-sky-600 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
