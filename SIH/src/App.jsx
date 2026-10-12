import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import {
  Activity,
  ArrowUpRight,
  Award,
  BarChart3,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  Flame,
  Heart,
  Home as HomeIcon,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  ScanLine,
  Search,
  Send,
  Settings2,
  Share2,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  Video,
  Zap,
} from "lucide-react";
import "./App.css";

const challengeData = [
  {
    title: "20 Squats Challenge",
    type: "Squat",
    target: "20 reps",
    difficulty: "Easy",
    participants: 1248,
    color: "mint",
    icon: "◒",
  },
  {
    title: "Push-up Precision",
    type: "Push-up",
    target: "60 sec",
    difficulty: "Medium",
    participants: 876,
    color: "blue",
    icon: "↘",
  },
  {
    title: "Jack Attack",
    type: "Jumping Jack",
    target: "40 reps",
    difficulty: "Hard",
    participants: 532,
    color: "purple",
    icon: "✦",
  },
];
const imageA =
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=85";
const imageB =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85";
const poseConnections = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28], [27, 31], [28, 32], [15, 17],
  [15, 19], [16, 18], [16, 20],
];

function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem("fitai-token")));
  const [authUser, setAuthUser] = useState(() => JSON.parse(localStorage.getItem("fitai-user") || "null"));
  const [page, setPage] = useState("home");
  const [exercise, setExercise] = useState("Squat");
  const [toast, setToast] = useState("");
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Maya Chen",
      handle: "@mayamoves",
      avatar: "MC",
      title: "The 20 squat reset",
      caption:
        "A quick form-first reset for your afternoon slump. Keep your heels grounded.",
      tags: ["#squats", "#mobility"],
      image: imageA,
      likes: 284,
      comments: 18,
      challenge: true,
    },
    {
      id: 2,
      author: "Jordan Lee",
      handle: "@jordanlee",
      avatar: "JL",
      title: "Sunday sweat club",
      caption:
        "Consistency looks good on everyone. Who is joining the next round?",
      tags: ["#sweatclub", "#fitai"],
      image: imageB,
      likes: 421,
      comments: 32,
    },
  ]);
  const [result, setResult] = useState({
    reps: 12,
    overall: 91,
    form: 92,
    accuracy: 90,
    speed: 88,
  });
  const go = (next, selected = exercise) => {
    setExercise(selected);
    setPage(next);
  };
  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };
  const share = () => {
    setPosts((current) => [
      {
        id: Date.now(),
        author: "You",
        handle: "@alexfit",
        avatar: "AK",
        title: `${result.overall}/100 on ${exercise}`,
        caption:
          "Small reps. Big proof. Just finished a focused session with FitAI.",
        tags: ["#fitai", "#progress"],
        image: imageB,
        likes: 0,
        comments: 0,
      },
      ...current,
    ]);
    notify("Result shared to your feed");
    setPage("home");
  };
  const authenticate = async ({ mode, name, email }) => {
    const endpoint = mode === "signup" ? "/register" : "/login";
    try {
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      const user = data.user || data;
      localStorage.setItem("fitai-token", data.token || "demo-fitai-token");
      localStorage.setItem("fitai-user", JSON.stringify(user));
      setAuthUser(user);
      setAuthenticated(true);
      notify(mode === "signup" ? "Welcome to FitAI" : "Welcome back");
    } catch {
      notify("API unavailable. Use Demo access to continue locally.");
    }
  };
  if (!authenticated) return <AuthPage onAuthenticate={authenticate} />;
  const pages = {
    home: <Home posts={posts} go={go} notify={notify} />,
    camera: (
      <CameraPage
        exercise={exercise}
        setExercise={setExercise}
        go={go}
        setResult={setResult}
      />
    ),
    result: (
      <Result exercise={exercise} result={result} share={share} go={go} />
    ),
    challenges: <Challenges go={go} />,
    detail: <Detail go={go} />,
    leaderboard: <Leaderboard />,
    profile: <Profile go={go} />,
    messages: <Messages />,
    create: (
      <Create
        go={go}
        onCreate={(newPost) => {
          setPosts((current) => [newPost, ...current]);
          notify("Challenge published to the community");
          setPage("home");
        }}
      />
    ),
  };
  return (
    <div className="app-shell">
      <Sidebar page={page} go={go} />
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu">
            <Menu size={21} />
          </button>
          <div className="mobile-title">
            {page === "home" ? "Good morning, Alex" : page.replace("-", " ")}
          </div>
          <div className="topbar-actions">
            <button className="icon-button">
              <Search size={18} />
            </button>
            <button className="icon-button">
              <Activity size={18} />
            </button>
              <button className="avatar avatar-sm" onClick={() => go("profile")}>
                {authUser?.name?.slice(0, 2).toUpperCase() || "AK"}
            </button>
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className="page-wrap"
            initial={{ opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {pages[page]}
          </motion.div>
        </AnimatePresence>
      </main>
      {toast && (
        <motion.div
          className="toast"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Check size={16} /> {toast}
        </motion.div>
      )}
    </div>
  );
}

function Sidebar({ page, go }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Sparkles size={17} />
        </span>
        fit<span className="brand-accent">ai</span>
      </div>
      <div className="workspace-label">YOUR WORKSPACE</div>
      <nav>
        <Nav
          icon={<HomeIcon size={18} />}
          text="Home"
          active={page === "home"}
          click={() => go("home")}
        />
        <Nav
          icon={<ScanLine size={18} />}
          text="AI Studio"
          active={page === "camera"}
          click={() => go("camera")}
          badge="LIVE"
        />
        <Nav
          icon={<Trophy size={18} />}
          text="Challenges"
          active={["challenges", "detail"].includes(page)}
          click={() => go("challenges")}
        />
        <Nav
          icon={<BarChart3 size={18} />}
          text="Leaderboard"
          active={page === "leaderboard"}
          click={() => go("leaderboard")}
        />
      </nav>
      <div className="workspace-label social-label">COMMUNITY</div>
      <nav>
        <Nav
          icon={<Users size={18} />}
          text="Discover"
          click={() => go("home")}
        />
        <Nav
          icon={<UserRound size={18} />}
          text="My profile"
          active={page === "profile"}
          click={() => go("profile")}
        />
        <Nav
          icon={<MessageCircle size={18} />}
          text="Messages"
          active={page === "messages"}
          click={() => go("messages")}
        />
      </nav>
      <button className="create-challenge" onClick={() => go("create")}>
        <Plus size={18} /> Create challenge
      </button>
      <div className="sidebar-footer">
        <div className="avatar avatar-sm">AK</div>
        <div>
          <strong>Alex Kim</strong>
          <span>
            7 day streak <Flame size={12} fill="currentColor" />
          </span>
        </div>
        <Settings2 size={16} />
      </div>
    </aside>
  );
}
function Nav({ icon, text, active, click, badge }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={click}>
      {icon}
      <span>{text}</span>
      {badge && <em>{badge}</em>}
    </button>
  );
}
function Home({ posts, go, notify }) {
  return (
    <div className="content-grid">
      <section className="feed-column">
        <div className="eyebrow-row">
          <div>
            <p className="eyebrow">THURSDAY, SEPTEMBER 10</p>
            <h1>
              Good morning, Alex <span className="wave">✦</span>
            </h1>
          </div>
          <button className="round-button" onClick={() => go("create")}>
            <Plus size={19} />
          </button>
        </div>
        <div className="hero-card">
          <div>
            <span className="live-pill">
              <span /> AI TRAINING LAB
            </span>
            <h2>
              Make your
              <br />
              <span>next rep count.</span>
            </h2>
            <p>Real-time form feedback that makes every workout smarter.</p>
            <button
              className="primary-button"
              onClick={() => go("camera", "Squat")}
            >
              <Camera size={17} /> Start a session <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="hero-stat">
            <span>YOUR WEEK</span>
            <strong>82</strong>
            <small>training score</small>
            <div className="mini-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="hero-grid" />
        </div>
        <Heading label="FROM THE COMMUNITY" title="Fresh movement" />
        <div className="feed-list">
          {posts.map((post) => (
            <Post key={post.id} post={post} go={go} notify={notify} />
          ))}
        </div>
      </section>
      <aside className="right-rail">
        <div className="rail-card streak-card">
          <div className="rail-card-head">
            <span className="eyebrow">YOUR MOMENTUM</span>
            <Flame size={18} className="flame" fill="currentColor" />
          </div>
          <div className="streak-number">
            07 <span>days</span>
          </div>
          <p>You're building a habit. Keep the rhythm going.</p>
          <div className="streak-dots">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <span
                key={`${day}${i}`}
                className={i < 5 ? "done" : i === 5 ? "today" : ""}
              >
                {i < 5 ? <Check size={12} /> : day}
              </span>
            ))}
          </div>
        </div>
        <div className="rail-card challenge-card">
          <div className="rail-card-head">
            <span className="eyebrow">TRENDING NOW</span>
            <Trophy size={17} />
          </div>
          <h3>
            Challenges
            <br />
            <span>worth showing up for.</span>
          </h3>
          {challengeData.slice(0, 2).map((item) => (
            <div
              className="mini-challenge"
              key={item.title}
              onClick={() => go("camera", item.type)}
            >
              <div className={`challenge-icon ${item.color}`}>{item.icon}</div>
              <div>
                <strong>{item.title}</strong>
                <span>{item.participants.toLocaleString()} joined</span>
              </div>
              <ChevronRight size={16} />
            </div>
          ))}
          <button className="text-button full" onClick={() => go("challenges")}>
            Explore challenges <ArrowUpRight size={15} />
          </button>
        </div>
      </aside>
    </div>
  );
}
function Heading({ label, title }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{label}</span>
        <h2>{title}</h2>
      </div>
      <button className="text-button">
        View all <ChevronRight size={15} />
      </button>
    </div>
  );
}
function Post({ post, go, notify }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="post-card">
      <div className="post-meta">
        <div className="avatar">{post.avatar}</div>
        <div>
          <strong>{post.author}</strong>
          <span>{post.handle} · 2h</span>
        </div>
        <button className="more-button">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="post-media">
        {post.video ? (
          <video src={post.video} controls playsInline muted aria-label="Challenge demo video" />
        ) : (
          <img src={post.image} alt="Workout in progress" />
        )}
        <div className="media-overlay">
          <span className="media-tag">
            <Video size={13} /> COMMUNITY POST
          </span>
          <button className="play-button">
            <Play size={17} fill="currentColor" />
          </button>
        </div>
      </div>
      <div className="post-body">
        <h3>{post.title}</h3>
        <p>{post.caption}</p>
        <div className="tags">
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="post-actions">
          <button
            className={liked ? "liked" : ""}
            onClick={() => {
              setLiked(!liked);
              notify("Added to your likes");
            }}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />{" "}
            {post.likes + (liked ? 1 : 0)}
          </button>
          <button>
            <MessageCircle size={18} /> {post.comments}
          </button>
          <button>
            <Share2 size={18} /> Share
          </button>
          {post.challenge && (
            <button
              className="try-button"
              onClick={() => go("camera", "Squat")}
            >
              TRY NOW <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
function pointAngle(first, vertex, last) {
  const a = Math.atan2(first.y - vertex.y, first.x - vertex.x);
  const b = Math.atan2(last.y - vertex.y, last.x - vertex.x);
  let degrees = Math.abs(((a - b) * 180) / Math.PI);
  return degrees > 180 ? 360 - degrees : degrees;
}
function landmarkReady(landmarks, indices) {
  return indices.every((index) => {
    const point = landmarks[index];
    const confidence = point?.visibility ?? point?.presence ?? 1;
    return Boolean(point) && confidence > 0.25;
  });
}
function CameraPage({ exercise, setExercise, go, setResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const loopRef = useRef(null);
  const phaseRef = useRef("up");
  const lastRepRef = useRef(0);
  const lowestAngleRef = useRef(180);
  const [running, setRunning] = useState(false);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState("Position yourself in frame");
  const [handCue, setHandCue] = useState(
    "Place both hands where the green wrist dots can see them",
  );
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState("");
  const [uploadedVideoName, setUploadedVideoName] = useState("");
  const [videoReady, setVideoReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [poseDetected, setPoseDetected] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [signals, setSignals] = useState({
    posture: 0,
    stability: 0,
    tempo: 0,
  });
  useEffect(() => {
    let stream;
    if (uploadedVideo) {
      setCameraReady(true);
      setVideoReady(false);
      setCameraError("");
      setFeedback("Video loaded — click Analyze video to begin");
      return undefined;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is unavailable in this browser.");
      return undefined;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      })
      .then((media) => {
        stream = media;
        setCameraReady(true);
        setCameraError("");
        setFeedback("Camera connected — start tracking when ready");
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          videoRef.current.play().catch(() => undefined);
        }
      })
      .catch((error) => {
        setCameraReady(false);
        setCameraError(
          error.name === "NotAllowedError"
            ? "Camera permission was blocked. Allow camera access in your browser, then retry."
            : error.name === "NotFoundError"
              ? "No camera was found. Connect a webcam, then retry."
              : "Camera could not start. Check that another app is not using it, then retry.",
        );
        setFeedback("Camera unavailable — analysis is paused");
      });
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [cameraAttempt, uploadedVideo]);
  useEffect(() => {
    if (!running) return undefined;
    if (uploadedVideo && videoRef.current) {
      videoRef.current.play().catch(() => setFeedback("Press play on the uploaded video to begin"));
    }
    const timer = setInterval(() => setElapsed((time) => time + 1), 1000);
    return () => clearInterval(timer);
  }, [running, uploadedVideo]);
  useEffect(() => {
    let cancelled = false;
    const startPose = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
        );
        const options = {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.55,
          minPosePresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
        };
        let landmarker;
        try {
          landmarker = await PoseLandmarker.createFromOptions(vision, options);
        } catch {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: { ...options.baseOptions, delegate: "CPU" },
          });
        }
        if (!cancelled) poseRef.current = landmarker;
        if (!cancelled) setModelReady(true);
      } catch {
        if (!cancelled) {
          setModelReady(false);
          setAnalysisError("AI model could not load. Check your internet connection and retry.");
          setFeedback("AI model unavailable — check your connection");
        }
      }
    };
    startPose();
    return () => {
      cancelled = true;
      poseRef.current?.close();
      poseRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (!running) {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      return undefined;
    }
    const drawPose = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = poseRef.current;
      if (video && canvas && landmarker && video.readyState >= 2 && video.videoWidth > 0 && (!uploadedVideo || !video.paused)) {
        let result;
        try {
          result = landmarker.detectForVideo(video, performance.now());
          setAnalysisError("");
        } catch (error) {
          setAnalysisError(`Frame analysis stopped: ${error.message || "unknown MediaPipe error"}`);
          setRunning(false);
          return;
        }
        const landmarks = result.landmarks?.[0];
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (landmarks) {
          setPoseDetected(true);
          context.strokeStyle = "#00ffb2";
          context.fillStyle = "#00ffb2";
          context.lineWidth = 3;
          for (const [startIndex, endIndex] of poseConnections) {
            const start = landmarks[startIndex];
            const end = landmarks[endIndex];
            if (start && end) {
              context.beginPath();
              context.moveTo(start.x * canvas.width, start.y * canvas.height);
              context.lineTo(end.x * canvas.width, end.y * canvas.height);
              context.stroke();
            }
          }
          landmarks.forEach((point) => {
            if ((point.visibility ?? point.presence ?? 1) > 0.25) {
              context.beginPath();
              context.arc(
                point.x * canvas.width,
                point.y * canvas.height,
                4,
                0,
                Math.PI * 2,
              );
              context.fill();
            }
          });
          const left = {
            shoulder: 11,
            elbow: 13,
            wrist: 15,
            hip: 23,
            knee: 25,
            ankle: 27,
          };
          const right = {
            shoulder: 12,
            elbow: 14,
            wrist: 16,
            hip: 24,
            knee: 26,
            ankle: 28,
          };
          const wristsVisible = landmarkReady(landmarks, [15, 16]);
          if (wristsVisible) {
            const wristGap = Math.abs(landmarks[15].x - landmarks[16].x);
            if (exercise === "Jumping Jack") {
              setHandCue(
                wristGap > 0.35
                  ? "Hands are wide — bring them back down together"
                  : "Raise both hands above your head",
              );
            } else if (exercise === "Push-up") {
              setHandCue(
                "Keep wrists under shoulders and elbows close to your body",
              );
            } else {
              setHandCue("Keep hands relaxed in front of your chest");
            }
          } else {
            setHandCue("Move your hands into frame until both wrist dots appear");
          }
          let posture = 0;
          let repDetected = false;
          if (exercise === "Squat" && (landmarkReady(landmarks, [left.hip, left.knee, left.ankle]) || landmarkReady(landmarks, [right.hip, right.knee, right.ankle]))) {
            const leftReady = landmarkReady(landmarks, [left.hip, left.knee, left.ankle]);
            const rightReady = landmarkReady(landmarks, [right.hip, right.knee, right.ankle]);
            const leftAngle = leftReady ? pointAngle(landmarks[left.hip], landmarks[left.knee], landmarks[left.ankle]) : 0;
            const rightAngle = rightReady ? pointAngle(landmarks[right.hip], landmarks[right.knee], landmarks[right.ankle]) : 0;
            const kneeAngle = leftReady && rightReady ? (leftAngle + rightAngle) / 2 : leftReady ? leftAngle : rightAngle;
            posture = Math.max(
              0,
              Math.min(100, Math.round(100 - Math.abs(kneeAngle - 100) * 0.8)),
            );
            setFeedback(
              kneeAngle < 125
                ? "Great depth — drive through your heels"
                : `Bend lower (${Math.round(kneeAngle)}°)`,
            );
            lowestAngleRef.current = Math.min(lowestAngleRef.current, kneeAngle);
            if (kneeAngle < 155) phaseRef.current = "down";
            const returnedFromDepth = kneeAngle > lowestAngleRef.current + 12;
            if ((kneeAngle > 155 || returnedFromDepth) && phaseRef.current === "down") {
              phaseRef.current = "up";
              repDetected = true;
            }
          } else if (exercise === "Push-up") {
            const leftPushupReady = landmarkReady(landmarks, [left.shoulder, left.elbow, left.wrist, left.hip]);
            const rightPushupReady = landmarkReady(landmarks, [right.shoulder, right.elbow, right.wrist, right.hip]);
            if (!leftPushupReady && !rightPushupReady) {
              setFeedback("Show your shoulder, elbow, wrist, and hip in frame");
            } else {
            const pushupSide = leftPushupReady ? left : right;
            const elbowAngle = pointAngle(landmarks[pushupSide.shoulder], landmarks[pushupSide.elbow], landmarks[pushupSide.wrist]);
            const alignment = Math.abs(landmarks[pushupSide.shoulder].y - landmarks[pushupSide.hip].y);
            posture = Math.max(
              0,
              Math.min(100, Math.round(100 - alignment * 420)),
            );
            setFeedback(
              elbowAngle < 125
                ? "Down phase — press through your hands"
                : `Up phase · elbow ${Math.round(elbowAngle)}°`,
            );
            if (elbowAngle < 135) phaseRef.current = "down";
            if (elbowAngle > 145 && phaseRef.current === "down") {
              phaseRef.current = "up";
              repDetected = true;
            }
            }
          } else if (
            exercise === "Jumping Jack" &&
            landmarkReady(landmarks, [11, 12, 15, 16, 23, 24, 27, 28])
          ) {
            const armsWide = Math.abs(landmarks[11].x - landmarks[12].x) > 0.35;
            const legsWide = Math.abs(landmarks[23].x - landmarks[24].x) > 0.28;
            posture = Math.round((Number(armsWide) + Number(legsWide)) * 50);
            setFeedback(
              armsWide && legsWide
                ? "Nice extension — bring it home"
                : "Spread your arms and legs wider",
            );
            if (armsWide && legsWide) phaseRef.current = "down";
            if (!armsWide && !legsWide && phaseRef.current === "down") {
              phaseRef.current = "up";
              repDetected = true;
            }
          }
          setSignals({
            posture,
            stability: Math.max(0, posture - 5),
            tempo: repDetected ? 96 : posture ? 78 : 0,
          });
          if (exercise === "Squat" && !repDetected) {
            setHandCue(`Squat phase: ${phaseRef.current === "down" ? "DOWN — return upright" : "UP — squat down"}`);
          }
          if (repDetected && Date.now() - lastRepRef.current > 500) {
            lastRepRef.current = Date.now();
            setReps((value) => value + 1);
          }
        } else {
          setPoseDetected(false);
        }
      }
      loopRef.current = requestAnimationFrame(drawPose);
    };
    loopRef.current = requestAnimationFrame(drawPose);
    return () => cancelAnimationFrame(loopRef.current);
  }, [running, exercise, uploadedVideo]);
  return (
    <div className="camera-page">
      <div className="camera-head">
        <div>
          <button className="back-button" onClick={() => go("home")}>
            <ChevronRight size={16} /> Exit studio
          </button>
          <p className="eyebrow">AI TRAINING LAB / LIVE ANALYSIS</p>
          <h1>
            {exercise} <span>session</span>
          </h1>
        </div>
        <div className="camera-status">
          <span /> {poseRef.current ? "AI model ready" : "Loading AI model"}
        </div>
      </div>
      <div className="exercise-tabs">
        {["Squat", "Push-up", "Jumping Jack"].map((item) => (
          <button
            className={exercise === item ? "selected" : ""}
            onClick={() => {
              setExercise(item);
              setReps(0);
              setRunning(false);
              setSignals({ posture: 0, stability: 0, tempo: 0 });
            }}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="analysis-source-bar">
        <label className="upload-analysis-button">
          <Video size={16} />
          {uploadedVideoName || "Upload workout video"}
          <input
            type="file"
            accept="video/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploadedVideoName(file.name);
              setUploadedVideo(URL.createObjectURL(file));
              setVideoReady(false);
              setAnalysisError("");
              setRunning(false);
              setReps(0);
              setElapsed(0);
              phaseRef.current = "up";
              lowestAngleRef.current = 180;
            }}
          />
        </label>
        <span>{uploadedVideo ? "Video source selected · MediaPipe will analyze each frame" : "Or use your webcam for live analysis"}</span>
      </div>
      <div className="camera-layout">
        <div className={`camera-frame ${cameraReady ? "camera-connected" : "camera-disconnected"}`}>
          <video ref={videoRef} src={uploadedVideo || undefined} autoPlay={!uploadedVideo} muted playsInline controls={Boolean(uploadedVideo)} onLoadedMetadata={() => setVideoReady(true)} onCanPlay={() => setVideoReady(true)} onEnded={() => setRunning(false)} onError={() => setAnalysisError("This video could not be loaded. Choose a supported MP4/WebM video.")} />
          <canvas ref={canvasRef} className="pose-canvas" />
          {!cameraReady && <div className="camera-fallback">
            <ScanLine size={44} />
            <strong>Camera preview unavailable</strong>
            <span>{cameraError || "Allow camera access to see your landmarks"}</span>
            <button className="camera-retry" onClick={() => setCameraAttempt((attempt) => attempt + 1)}>Enable camera</button>
          </div>}
          {cameraReady && <div className="camera-live-label"><span /> {poseDetected ? "Pose detected" : uploadedVideo ? (videoReady ? "Video ready" : "Loading video") : "Searching for pose"}</div>}
          <div className="camera-corner top-left" />
          <div className="camera-corner top-right" />
          <div className="camera-corner bottom-left" />
          <div className="camera-corner bottom-right" />
          <div className="camera-overlay-top">
            <span className="live-pill">
              <span /> LIVE
            </span>
            <span className="timer">00:{String(elapsed).padStart(2, "0")}</span>
          </div>
          <div className="rep-counter">
            <span>REPS</span>
            <strong>{String(reps).padStart(2, "0")}</strong>
            <small>Keep moving</small>
          </div>
          <div className="feedback-pill">
            <Sparkles size={15} /> {feedback}
          </div>
          <div className="hand-guide">
            <span className="hand-guide-dot" />
            <div>
              <strong>HAND POSITION</strong>
              <small>{handCue}</small>
            </div>
          </div>
        </div>
        <aside className="analysis-panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">REAL-TIME SIGNALS</span>
              <h2>Form coach</h2>
            </div>
            <CircleHelp size={17} />
          </div>
          <Signal label="Posture" value={signals.posture} color="mint" />
          <Signal label="Stability" value={signals.stability} color="blue" />
          <Signal label="Tempo" value={signals.tempo} color="purple" />
          <div className="coach-note">
            <span>
              <Zap size={16} />
            </span>
            <div>
              <strong>Coach's note</strong>
              <p>{analysisError || (running ? "Live landmarks are driving your score and rep count." : "Start tracking to receive live cues from your AI coach.")}</p>
            </div>
          </div>
          <button
            className="primary-button wide"
            disabled={!modelReady || (Boolean(uploadedVideo) && !videoReady)}
            onClick={() =>
              running
                ? (setResult({
                    reps,
                    overall:
                      Math.round(
                        (signals.posture + signals.stability + signals.tempo) /
                          3,
                      ) || 0,
                    form: signals.posture,
                    accuracy: signals.stability,
                    speed: signals.tempo,
                  }),
                  go("result"))
                : setRunning(true)
            }
          >
            {running ? "Finish session" : !modelReady ? "Loading AI model" : uploadedVideo && !videoReady ? "Loading video" : uploadedVideo ? "Analyze video" : "Start tracking"}
            <ArrowUpRight size={17} />
          </button>
        </aside>
      </div>
    </div>
  );
}
function Signal({ label, value, color }) {
  return (
    <div className="signal">
      <div>
        <span>{label}</span>
        <strong>{value ? `${value}%` : "--"}</strong>
      </div>
      <div className="signal-track">
        <i className={color} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
function Result({ exercise, result, share, go }) {
  return (
    <div className="result-page">
      <div className="result-kicker">
        <span className="success-icon">
          <Check size={19} />
        </span>
        <span>SESSION COMPLETE</span>
      </div>
      <h1>
        That was <span>solid.</span>
      </h1>
      <p className="result-lede">
        Your form is getting stronger, one focused rep at a time.
      </p>
      <div className="result-layout">
        <div className="score-card">
          <div className="score-ring">
            <div>
              <strong>{result.overall}</strong>
              <span>/100</span>
            </div>
          </div>
          <span className="score-label">OVERALL SCORE</span>
          <div className="score-bars">
            <Metric label="Form" value={result.form} color="mint" />
            <Metric label="Accuracy" value={result.accuracy} color="blue" />
            <Metric label="Speed" value={result.speed} color="purple" />
          </div>
        </div>
        <div className="result-summary">
          <div className="summary-top">
            <span className="eyebrow">{exercise.toUpperCase()} SESSION</span>
            <span className="summary-date">TODAY · 08:42</span>
          </div>
          <h2>
            {result.reps} reps <span>completed</span>
          </h2>
          <p>
            AI analysis found a clean rhythm with great control through the
            hardest part of each rep.
          </p>
          <div className="result-actions">
            <button className="primary-button" onClick={share}>
              <Share2 size={17} /> Share result
            </button>
            <button
              className="secondary-button"
              onClick={() => go("challenges")}
            >
              <Trophy size={17} /> Join a challenge
            </button>
            <button className="retry-button" onClick={() => go("camera")}>
              Retry session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function Metric({ label, value, color }) {
  return (
    <div className="result-metric">
      <span>{label}</span>
      <div className="metric-line">
        <i className={color} style={{ width: `${value}%` }} />
      </div>
      <strong>{value}%</strong>
    </div>
  );
}
function Challenges({ go }) {
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">TRAIN TOGETHER</span>
          <h1>
            Challenges <span>that move you.</span>
          </h1>
          <p>
            Pick a goal, bring your energy, and let the community keep you
            accountable.
          </p>
        </div>
        <button className="primary-button" onClick={() => go("create")}>
          <Plus size={17} /> Create challenge
        </button>
      </div>
      <div className="challenge-feature">
        <div>
          <span className="live-pill">
            <span /> THIS WEEK'S FOCUS
          </span>
          <h2>
            Control is
            <br />
            <span>your superpower.</span>
          </h2>
          <p>Score higher by slowing down and owning every rep.</p>
          <button
            className="secondary-button light"
            onClick={() => go("camera", "Squat")}
          >
            Try focus session <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="feature-orbit">
          <div className="orbit-center">
            <ScanLine size={25} />
            <strong>91</strong>
            <span>avg. score</span>
          </div>
          <div className="orbit-dot dot-one" />
          <div className="orbit-dot dot-two" />
        </div>
      </div>
      <Heading label="ALL CHALLENGES" title="Find your next win" />
      <div className="challenge-grid">
        {challengeData.map((item) => (
          <div
            className="challenge-tile"
            key={item.title}
            onClick={() => go("detail")}
          >
            <div className={`challenge-icon large ${item.color}`}>
              {item.icon}
            </div>
            <div className="tile-meta">
              <span>{item.type}</span>
              <b className={`difficulty ${item.difficulty.toLowerCase()}`}>
                {item.difficulty}
              </b>
            </div>
            <h3>{item.title}</h3>
            <p>
              {item.target} · {item.participants.toLocaleString()} participants
            </p>
            <button
              className="tile-button"
              onClick={(event) => {
                event.stopPropagation();
                go("camera", item.type);
              }}
            >
              Try now <ArrowUpRight size={14} />
            </button>
          </div>
        ))}
        <div
          className="challenge-tile create-tile"
          onClick={() => go("create")}
        >
          <div className="create-plus">
            <Plus size={24} />
          </div>
          <h3>Make your own</h3>
          <p>Set a goal and invite the community.</p>
          <button className="text-button">
            Create challenge <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
function Detail({ go }) {
  return (
    <div className="standard-page detail-page">
      <button className="back-button" onClick={() => go("challenges")}>
        <ChevronRight size={16} /> All challenges
      </button>
      <div className="detail-hero">
        <div>
          <span className="live-pill">
            <span /> SYSTEM CHALLENGE
          </span>
          <h1>
            20 Squats
            <br />
            <span>Challenge</span>
          </h1>
          <p>
            Build the habit with 20 intentional squats. Your AI coach scores
            depth, control, and consistency.
          </p>
          <div className="detail-stats">
            <span>
              <strong>1,248</strong> participants
            </span>
            <span>
              <strong>7 days</strong> remaining
            </span>
            <span>
              <strong>Easy</strong> difficulty
            </span>
          </div>
          <button
            className="primary-button"
            onClick={() => go("camera", "Squat")}
          >
            <Camera size={17} /> Try it now <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="detail-visual">
          <div className="big-number">
            20<span>reps</span>
          </div>
          <div className="floating-score">
            <Trophy size={16} /> 91 avg score
          </div>
        </div>
      </div>
      <div className="detail-columns">
        <div className="leader-preview">
          <Heading label="WEEKLY LEADERBOARD" title="Top performers" />
          {["Samira Jones", "Maya Chen", "Theo Wright"].map((name, i) => (
            <div className="leader-row" key={name}>
              <span className="rank">0{i + 1}</span>
              <div className="avatar">
                {name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <strong>{name}</strong>
              <span className="leader-score">{[98, 96, 94][i]} pts</span>
            </div>
          ))}
        </div>
        <div className="how-card">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>
            Show up.
            <br />
            Score honestly.
          </h2>
          <p>
            FitAI uses your camera to look at joint angles and body alignment,
            then gives you a score you can learn from.
          </p>
          <div className="step">
            <span>01</span> Start your camera session
          </div>
          <div className="step">
            <span>02</span> Complete 20 quality reps
          </div>
          <div className="step">
            <span>03</span> Share your result
          </div>
        </div>
      </div>
    </div>
  );
}
function Leaderboard() {
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">COMMUNITY SCOREBOARD</span>
          <h1>
            Leaderboard <span>for the week.</span>
          </h1>
          <p>
            Consistency earns the top spot. Here is who is moving the room right
            now.
          </p>
        </div>
        <div className="week-selector">
          This week <ChevronRight size={15} />
        </div>
      </div>
      <div className="podium">
        <div className="podium-person second">
          <span className="podium-avatar">MC</span>
          <strong>Maya Chen</strong>
          <em>96 pts</em>
          <i>2</i>
        </div>
        <div className="podium-person first">
          <span className="podium-avatar">SJ</span>
          <strong>Samira Jones</strong>
          <em>98 pts</em>
          <i>1</i>
        </div>
        <div className="podium-person third">
          <span className="podium-avatar">TW</span>
          <strong>Theo Wright</strong>
          <em>94 pts</em>
          <i>3</i>
        </div>
      </div>
      <div className="ranking-list">
        {["Amara Singh", "You", "Lena Ortiz", "Marco Rossi"].map(
          (name, index) => (
            <div className="ranking-row" key={name}>
              <span>0{index + 4}</span>
              <div className="avatar">
                {name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <strong>{name}</strong>
              <span className="rank-workouts">{12 - index} workouts</span>
              <b>{[92, 91, 88, 86][index]} pts</b>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
function Profile({ go }) {
  return (
    <div className="standard-page profile-page">
      <div className="profile-cover" />
      <div className="profile-header">
        <div className="avatar profile-avatar">AK</div>
        <div className="profile-identity">
          <h1>
            Alex Kim <span>✓</span>
          </h1>
          <p>@alexfit · Making movement a daily thing.</p>
          <div className="profile-stats">
            <strong>
              24 <span>workouts</span>
            </strong>
            <strong>
              1,204 <span>followers</span>
            </strong>
            <strong>
              186 <span>following</span>
            </strong>
          </div>
        </div>
        <div className="profile-actions">
        <button className="secondary-button" onClick={() => go("messages")}>
          <MessageCircle size={16} /> Message
        </button>
        <button className="secondary-button" onClick={() => go("camera")}>
          <Camera size={16} /> Start workout
        </button>
        </div>
      </div>
      <div className="achievement-row">
        <div>
          <Award size={17} />
          <span>
            <strong>Intermediate</strong>
            <small>current level</small>
          </span>
        </div>
        <div>
          <Flame size={17} />
          <span>
            <strong>7 day streak</strong>
            <small>personal best: 12</small>
          </span>
        </div>
        <div>
          <Trophy size={17} />
          <span>
            <strong>Top 10%</strong>
            <small>this month</small>
          </span>
        </div>
      </div>
      <Heading label="YOUR JOURNEY" title="Recent sessions" />
      <div className="profile-grid">
        {[
          imageA,
          imageB,
          "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=85",
        ].map((src, i) => (
          <div className="profile-post" key={src}>
            <img src={src} alt="Workout session" />
            <span>
              {[91, 88, 84][i]}
              <small>/100</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Messages() {
  const [activePerson, setActivePerson] = useState("Maya Chen");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    { person: "Maya Chen", text: "That squat reset was harder than it looked. Your form cues helped!", mine: false },
    { person: "Maya Chen", text: "Same here. I am trying the challenge again tomorrow.", mine: true },
  ]);
  const people = [
    { name: "Maya Chen", handle: "@mayamoves", avatar: "MC", status: "Active now" },
    { name: "Jordan Lee", handle: "@jordanlee", avatar: "JL", status: "Active 12m ago" },
    { name: "Samira Jones", handle: "@samiraj", avatar: "SJ", status: "Active yesterday" },
  ];
  const active = people.find((person) => person.name === activePerson) || people[0];
  const sendMessage = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages((current) => [...current, { person: active.name, text: draft.trim(), mine: true }]);
    setDraft("");
  };
  return <div className="standard-page messages-page"><div className="page-intro"><div><span className="eyebrow">COMMUNITY CHAT</span><h1>Messages <span>that keep you moving.</span></h1><p>Talk form, share progress, and find your next training partner.</p></div></div><div className="messages-layout"><aside className="conversation-list"><div className="message-search"><Search size={15} /><input placeholder="Search messages" /></div>{people.map((person) => <button className={`conversation ${person.name === active.name ? "selected" : ""}`} key={person.name} onClick={() => setActivePerson(person.name)}><div className="avatar">{person.avatar}</div><div><strong>{person.name}</strong><span>{person.status}</span></div><b>•</b></button>)}</aside><section className="chat-panel"><header className="chat-header"><div className="avatar">{active.avatar}</div><div><strong>{active.name}</strong><span>{active.handle} · {active.status}</span></div><button className="icon-button"><MoreHorizontal size={18} /></button></header><div className="chat-messages">{messages.filter((message) => message.person === active.name).map((message, index) => <div className={`chat-bubble ${message.mine ? "mine" : ""}`} key={`${message.text}-${index}`}>{message.text}<small>{message.mine ? "You" : active.name} · now</small></div>)}</div><form className="message-composer" onSubmit={sendMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${active.name.split(" ")[0]}...`} /><button className="primary-button" type="submit" aria-label="Send message"><Send size={16} /></button></form></section></div></div>;
}

function Create({ go, onCreate }) {
  const [form, setForm] = useState({
    title: "",
    type: "Squat",
    target: "20 reps",
    difficulty: "Medium",
    description: "",
  });
  const [videoPreview, setVideoPreview] = useState("");
  const [videoName, setVideoName] = useState("");
  const update = (key, value) => setForm({ ...form, [key]: value });
  return (
    <div className="standard-page create-page">
      <button className="back-button" onClick={() => go("home")}>
        <ChevronRight size={16} /> Cancel
      </button>
      <div className="create-layout">
        <div className="create-copy">
          <span className="eyebrow">YOUR TURN TO LEAD</span>
          <h1>
            Create a challenge <span>people want to join.</span>
          </h1>
          <p>
            Make it clear, make it achievable, and make it yours. Your challenge
            will appear in the community feed.
          </p>
          <div className="create-preview">
            <span className="eyebrow">LIVE PREVIEW</span>
            <div className="preview-card">
              <div className="challenge-icon mint">✦</div>
              <div>
                <strong>{form.title || "Your challenge title"}</strong>
                <span>
                  {form.target} · {form.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
        <form
          className="form-card"
          onSubmit={(event) => {
            event.preventDefault();
            onCreate({
              id: Date.now(),
              author: "You",
              handle: "@alexfit",
              avatar: "AK",
              title: form.title || "Community movement challenge",
              caption:
                form.description ||
                "A new community challenge. Ready when you are.",
              tags: [
                "#community",
                `#${form.type.toLowerCase().replace(" ", "")}`,
              ],
              image: imageA,
              video: videoPreview,
              likes: 0,
              comments: 0,
              challenge: true,
            });
          }}
        >
          <div className="form-head">
            <div>
              <span className="eyebrow">CHALLENGE DETAILS</span>
              <h2>Set the intention</h2>
            </div>
            <Sparkles size={20} />
          </div>
          <label>
            Challenge title
            <input
              required
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="e.g. 50 Push-ups Challenge"
            />
          </label>
          <label>
            Exercise type
            <div className="select-row">
              {["Squat", "Push-up", "Jumping Jack"].map((type) => (
                <button
                  type="button"
                  className={form.type === type ? "selected" : ""}
                  key={type}
                  onClick={() => update("type", type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </label>
          <div className="form-two">
            <label>
              Target
              <input
                value={form.target}
                onChange={(event) => update("target", event.target.value)}
                placeholder="20 reps"
              />
            </label>
            <label>
              Difficulty
              <select
                value={form.difficulty}
                onChange={(event) => update("difficulty", event.target.value)}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="What will people get from showing up?"
            />
          </label>
          <label className={`upload-label ${videoPreview ? "has-video" : ""}`}>
            <span className="upload-box">
              <Video size={18} />
            </span>
            <span>
                <strong>{videoName || "Add a demo video"}</strong>
                <small>{videoPreview ? "Video ready to publish" : "Optional · MP4 up to 60 sec"}</small>
            </span>
            <input
              type="file"
              accept="video/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setVideoName(file.name);
                setVideoPreview(URL.createObjectURL(file));
              }}
            />
          </label>
          {videoPreview && <video className="challenge-video-preview" src={videoPreview} controls muted playsInline />}
          <button className="primary-button wide" type="submit">
            Publish challenge <ArrowUpRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}

function AuthPage({ onAuthenticate }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <div className="auth-shell">
      <div className="auth-visual"><span className="brand"><span className="brand-mark"><Sparkles size={17} /></span>fit<span className="brand-accent">ai</span></span><div><span className="eyebrow">MOVE WITH INTENTION</span><h1>Your body.<br /><span>Your data.</span><br />Your momentum.</h1><p>AI-powered form coaching meets a community that keeps you showing up.</p></div><div className="auth-orbit"><ScanLine size={28} /><strong>91</strong><small>average form score</small></div></div>
      <form className="auth-card" onSubmit={(event) => { event.preventDefault(); onAuthenticate({ mode, name, email }); }}>
        <span className="eyebrow">{mode === "login" ? "WELCOME BACK" : "JOIN THE MOVEMENT"}</span>
        <h2>{mode === "login" ? "Sign in to your training space" : "Create your FitAI account"}</h2>
        <p>{mode === "login" ? "Pick up where your last rep left off." : "Start tracking progress with a community behind you."}</p>
        {mode === "signup" && <label>Your name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Kim" /></label>}
        <label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
        <label>Password<input required type="password" minLength="6" placeholder="••••••••" /></label>
        <button className="primary-button wide" type="submit">{mode === "login" ? "Sign in" : "Create account"}<ArrowUpRight size={17} /></button>
        <button className="demo-access" type="button" onClick={() => onAuthenticate({ mode: "login", email: "alex@fitai.demo" })}>Continue with demo account</button>
        <div className="auth-switch">{mode === "login" ? "New to FitAI?" : "Already have an account?"}<button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Create account" : "Sign in"}</button></div>
      </form>
    </div>
  );
}

export default App;
