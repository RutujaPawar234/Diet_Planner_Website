import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Flame,
  HeartPulse,
  Lock,
  Scale,
  Target,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../hooks/useAuth';

const FEATURES = [
  { icon: CalendarDays, tone: 'coral', title: 'Personalized Diet Plans', text: 'Daily plans built around your calorie target, dietary preference and allergies — generated in one click.' },
  { icon: Flame, tone: 'yellow', title: 'Calorie Tracking', text: 'Tick off meals as you eat them and always know how many calories you have left for the day.' },
  { icon: HeartPulse, tone: 'purple', title: 'BMI & Health Metrics', text: 'BMI, BMR and daily energy needs calculated with the Mifflin-St Jeor equation.' },
  { icon: TrendingUp, tone: 'pink', title: 'Progress Tracking', text: 'Log weigh-ins and watch your trend on a clean chart, with your target weight in view.' },
  { icon: UtensilsCrossed, tone: 'coral', title: 'Meal Management', text: 'Browse 50+ balanced meals, filter by diet and calories, or add your own recipes.' },
  { icon: Lock, tone: 'purple', title: 'Secure Account', text: 'Encrypted passwords and token-based sessions keep your health data private to you.' },
];

const STEPS = [
  { title: 'Create your profile', text: 'Age, height, weight, activity and preferences.' },
  { title: 'Set your goal', text: 'Lose, maintain or gain — at a sustainable pace.' },
  { title: 'Get your diet plan', text: 'A balanced day of meals matched to your target.' },
  { title: 'Track your meals', text: 'Mark meals as eaten and adjust servings.' },
  { title: 'Monitor your progress', text: 'Log weight and see your trend over time.' },
];

/** Static product preview for the hero — pure markup, no data. */
function HeroPreview() {
  const meals = [
    { slot: 'Breakfast', name: 'Moong Dal Chilla', kcal: 290, done: true },
    { slot: 'Lunch', name: 'Paneer Tikka Bowl', kcal: 520, done: true },
    { slot: 'Snacks', name: 'Greek Yogurt with Honey', kcal: 150, done: false },
    { slot: 'Dinner', name: 'Tofu Stir-Fry with Brown Rice', kcal: 480, done: false },
  ];
  return (
    <div className="hero-preview" aria-hidden="true">
      <div className="preview-window">
        <div className="preview-top">
          <span />
          <span />
          <span />
        </div>
        <div className="preview-body">
          <div className="preview-stats">
            <div className="preview-stat tone-purple">
              <small>BMI</small>
              <strong>22.4</strong>
              <em className="ok">Normal range</em>
            </div>
            <div className="preview-stat tone-coral">
              <small>Daily goal</small>
              <strong>1,590</strong>
              <em>kcal</em>
            </div>
            <div className="preview-stat tone-yellow">
              <small>Consumed</small>
              <strong>810</strong>
              <em>780 left</em>
            </div>
          </div>
          <div className="preview-plan">
            <div className="preview-plan-head">
              <strong>Today&apos;s plan</strong>
              <span className="badge badge-yellow">Vegetarian</span>
            </div>
            {meals.map((m) => (
              <div className={`preview-meal ${m.done ? 'done' : ''}`} key={m.slot}>
                <span className="preview-check">{m.done && <Check size={12} />}</span>
                <div className="grow">
                  <small className={`slot-text-${m.slot.toLowerCase()}`}>{m.slot}</small>
                  <div>{m.name}</div>
                </div>
                <span className="num">{m.kcal} kcal</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="floating-card fc-1 tone-yellow">
        <span className="stat-icon">
          <Target />
        </span>
        <div>
          <small>Weekly trend</small>
          <strong>−0.6 kg</strong>
        </div>
      </div>
      <div className="floating-card fc-2 tone-pink">
        <span className="stat-icon">
          <Scale />
        </span>
        <div>
          <small>Protein today</small>
          <strong>62 / 99 g</strong>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  useDocumentTitle('');
  const { isAuthenticated } = useAuth();
  const ctaTo = isAuthenticated ? '/dashboard' : '/register';

  return (
    <>
      <section className="hero">
        <div className="hero-decor" aria-hidden="true">
          <span className="decor-blob" />
          <span className="decor-ring" />
          <span className="decor-orange" />
          <span className="decor-leaf" />
          <span className="decor-berry" />
          <span className="decor-berry two" />
        </div>
        <div className="container hero-grid">
          <div className="hero-copy fade-up">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Personalised nutrition planning
            </span>
            <h1>
              Plan Better. Eat Smarter. <span className="accent">Live Healthier.</span>
            </h1>
            <p className="hero-sub">
              NutriPlan helps you create personalized diet plans, understand your nutrition goals, and track your progress in one place.
            </p>
            <div className="hero-actions">
              <Link to={ctaTo} className="btn btn-primary btn-lg">
                Get Started <ArrowRight />
              </Link>
              <a href="#features" className="btn btn-outline-accent btn-lg">
                Explore Features
              </a>
            </div>
            <ul className="hero-points">
              <li>
                <Check /> Free to use
              </li>
              <li>
                <Check /> Veg, vegan, egg & non-veg
              </li>
              <li>
                <Check /> Allergy-aware
              </li>
            </ul>
          </div>
          <HeroPreview />
        </div>
      </section>

      <section id="features" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Features</span>
            <h2>Everything you need to eat with intention</h2>
            <p>From your first calorie estimate to your tenth weigh-in, NutriPlan keeps the whole picture in one calm, focused workspace.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map(({ icon: Icon, tone, title, text }) => (
              <article key={title} className={`feature-card tone-${tone}`}>
                <span className="feature-icon">
                  <Icon aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>From sign-up to your first plan in minutes</h2>
          </div>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="step">
                <span className="step-num">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta">
            <div>
              <h2>Start Planning Your Nutrition Today</h2>
              <p>Create your free account and get a personalised plan built around your goals.</p>
            </div>
            <Link to={ctaTo} className="btn btn-lg cta-btn">
              {isAuthenticated ? 'Go to dashboard' : 'Create free account'} <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
