import React, { useState, useEffect } from 'react';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ExpenseTracker from './ExpenseTracker';

function App() {
  // ===== STATE =====
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Budget Calculator
  const [income, setIncome] = useState(50000);
  const [fixed, setFixed] = useState(25000);
  const [variable, setVariable] = useState(15000);
  const [showResult, setShowResult] = useState(false);
  const [budgetData, setBudgetData] = useState(null);
  
  // Savings Planner
  const [goalAmount, setGoalAmount] = useState(100000);
  const [monthlySave, setMonthlySave] = useState(10000);
  const [planResult, setPlanResult] = useState(null);
  const [progress, setProgress] = useState(0);
  
  // FAQ
  const [openFaq, setOpenFaq] = useState(0);
  
  // Contact Form
  const [formData, setFormData] = useState({ name: '', email: '', question: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Toast Notification
  const [toast, setToast] = useState(null);
  
  // Investment Calculator
  const [investResult, setInvestResult] = useState(null);

  // ===== EFFECTS =====
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ===== BUDGET CALCULATOR =====
  const handleCalculateBudget = () => {
    if (income <= 0) {
      setToast({ type: 'error', message: 'Please enter a valid income.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const totalExpenses = fixed + variable;
    const remaining = income - totalExpenses;
    const needs = income * 0.5;
    const wants = income * 0.3;
    const savings = income * 0.2;

    setBudgetData({
      needs,
      wants,
      savings,
      remaining,
      totalExpenses,
      isOverSpending: remaining < 0
    });
    setShowResult(true);
    setToast({ type: 'success', message: 'Budget calculated successfully!' });
    setTimeout(() => setToast(null), 3000);
  };

  // ===== SAVINGS PLANNER =====
  const handleCalculatePlan = () => {
    if (goalAmount <= 0 || monthlySave <= 0) {
      setToast({ type: 'error', message: 'Please enter valid amounts for both fields.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const months = Math.ceil(goalAmount / monthlySave);
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    let timeStr = '';
    if (years > 0) timeStr += `${years} year${years > 1 ? 's' : ''}`;
    if (remMonths > 0) timeStr += `${years > 0 ? ' and ' : ''}${remMonths} month${remMonths > 1 ? 's' : ''}`;
    if (!timeStr) timeStr = 'less than a month';

    const progressPercent = Math.min(100, (monthlySave / goalAmount) * 100);
    setProgress(progressPercent);

    setPlanResult({
      months,
      timeStr,
      totalSaved: monthlySave * months,
      progressPercent
    });
    setToast({ type: 'success', message: 'Savings plan calculated!' });
    setTimeout(() => setToast(null), 3000);
  };

  // ===== INVESTMENT CALCULATOR =====
  const calculateInvestment = () => {
    const initial = parseFloat(document.getElementById('initialInvestment')?.value) || 0;
    const monthly = parseFloat(document.getElementById('monthlyContribution')?.value) || 0;
    const rate = parseFloat(document.getElementById('interestRate')?.value) || 0;
    const years = parseFloat(document.getElementById('investmentYears')?.value) || 0;

    if (initial <= 0 && monthly <= 0) {
      setToast({ type: 'error', message: 'Please enter at least an initial investment or monthly contribution.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    
    let total = initial;
    for (let i = 0; i < months; i++) {
      total = total * (1 + monthlyRate) + monthly;
    }
    
    const totalInvested = initial + (monthly * months);
    const totalEarnings = total - totalInvested;

    setInvestResult({
      totalInvested,
      total,
      totalEarnings,
      roi: (totalEarnings / totalInvested) * 100
    });
    setToast({ type: 'success', message: 'Investment calculated!' });
    setTimeout(() => setToast(null), 3000);
  };

  // ===== FAQ =====
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index);
  };

  // ===== CONTACT FORM =====
  const handleSubmitForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.question.trim()) errors.question = 'Question is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setToast({ type: 'error', message: 'Please fix the form errors.' });
      setTimeout(() => setToast(null), 3000);
    } else {
      setFormErrors({});
      setFormSubmitted(true);
      setToast({ type: 'success', message: 'Your question has been sent!' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // ===== RENDER =====
  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {toast.message}
        </div>
      )}

      {/* ======== NAVIGATION ======== */}
      <nav>
        <div className="container nav-flex">
          <div className="logo">
            <i className="fas fa-seedling"></i> MoneyMentor Kenya
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-clock"></i>
              {currentTime.toLocaleTimeString()}
            </div>
            
            <button 
              className="dark-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            
            <button 
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
          
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#home" onClick={() => setMenuOpen(false)}><i className="fas fa-home"></i> Home</a></li>
            <li><a href="#learn" onClick={() => setMenuOpen(false)}><i className="fas fa-book"></i> Learn</a></li>
            <li><a href="#calculator" onClick={() => setMenuOpen(false)}><i className="fas fa-calculator"></i> Budget</a></li>
            <li><a href="#planner" onClick={() => setMenuOpen(false)}><i className="fas fa-bullseye"></i> Planner</a></li>
            <li><a href="#invest" onClick={() => setMenuOpen(false)}><i className="fas fa-chart-line"></i> Invest</a></li>
            <li>
    <a href="#expenses" onClick={() => setMenuOpen(false)}>
      <i className="fas fa-receipt"></i> Expenses
    </a>
  </li>
            <li><a href="#resources" onClick={() => setMenuOpen(false)}><i className="fas fa-podcast"></i> Resources</a></li>
            <li><a href="#contact" onClick={() => setMenuOpen(false)}><i className="fas fa-envelope"></i> Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* ======== HOME / HERO ======== */}
      <section id="home">
        <div className="container hero-grid">
          <div>
            <h1 className="hero-title">Build Your <span>Financial Future</span> with MoneyMentor</h1>
            <p className="hero-desc">
              MoneyMentor Kenya empowers young adults with practical tools, expert insights, 
              and a community that grows together. Start your journey to financial freedom today.
            </p>
            <a href="#calculator" className="btn"><i className="fas fa-play"></i> Start Planning</a>
            <div className="hero-stats">
              <div><span className="num">12k+</span> <span className="label">Learners</span></div>
              <div><span className="num">KSh 0</span> <span className="label">Free Resources</span></div>
              <div><span className="num">98%</span> <span className="label">Satisfaction</span></div>
            </div>
          </div>
          <div className="hero-img">
            <i className="fas fa-chart-pie"></i>
            <p style={{ fontSize: '1.2rem', marginTop: '12px', color: 'var(--text-dark)' }}>
              Smart money, brighter tomorrow.
            </p>
          </div>
        </div>
      </section>

      {/* ======== LEARN ======== */}
      <section id="learn">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-graduation-cap" style={{ marginRight: '12px' }}></i>
            Learn & Grow
          </h2>
          <p className="section-sub">
            Bite-sized articles and guides to master budgeting, saving, investing, and debt management.
          </p>
          <div className="card-grid">
            <div className="card">
              <i className="fas fa-wallet"></i>
              <h3>Budgeting 101</h3>
              <p>Learn the 50/30/20 rule and how to track every shilling.</p>
            </div>
            <div className="card">
              <i className="fas fa-piggy-bank"></i>
              <h3>Smart Saving</h3>
              <p>Emergency funds, sinking funds, and high-yield savings.</p>
            </div>
            <div className="card">
              <i className="fas fa-chart-line"></i>
              <h3>Investing Basics</h3>
              <p>Stocks, bonds, MMFs, and how to start with little capital.</p>
            </div>
            <div className="card">
              <i className="fas fa-hand-holding-usd"></i>
              <h3>Debt Management</h3>
              <p>Strategies to pay off loans and avoid bad debt traps.</p>
            </div>
          </div>
          <div className="quiz-box">
            <h3><i className="fas fa-question-circle"></i> Quick Quiz: Are you a saver or a spender?</h3>
            <button 
              className="btn btn-outline" 
              onClick={() => {
                setToast({ type: 'success', message: "✅ You scored 8/10! You're a mindful saver." });
                setTimeout(() => setToast(null), 3000);
              }}
              style={{ marginTop: '12px' }}
            >
              Take the 2-min quiz
            </button>
          </div>
        </div>
      </section>

      {/* ======== BUDGET CALCULATOR ======== */}
      <section id="calculator">
        <div className="container">
          <h2 className="section-title text-center">
            <i className="fas fa-calculator"></i> Budget Calculator
          </h2>
          <p className="section-sub text-center mx-auto">
            Enter your monthly income and expenses. We'll suggest a balanced budget.
          </p>
          <div className="calc-box">
            <div className="form-group">
              <label>Monthly Income (KSh)</label>
              <input 
                type="number" 
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                placeholder="e.g. 50000"
              />
            </div>
            <div className="form-group">
              <label>Fixed Expenses (rent, bills, loans)</label>
              <input 
                type="number" 
                value={fixed}
                onChange={(e) => setFixed(Number(e.target.value))}
                placeholder="e.g. 25000"
              />
            </div>
            <div className="form-group">
              <label>Variable Expenses (food, transport, entertainment)</label>
              <input 
                type="number" 
                value={variable}
                onChange={(e) => setVariable(Number(e.target.value))}
                placeholder="e.g. 15000"
              />
            </div>
            <button className="btn" onClick={handleCalculateBudget}>
              <i className="fas fa-sync-alt"></i> Calculate Budget
            </button>
            
            {showResult && budgetData && (
              <div className="calc-result show">
                <p><strong>Suggested Budget</strong></p>
                <div>
                  <p>💡 Based on your income, a balanced 50/30/20 budget looks like:</p>
                  <ul style={{ listStyle: 'none', marginTop: '10px' }}>
                    <li><strong>Needs (50%):</strong> KSh {budgetData.needs.toLocaleString()}</li>
                    <li><strong>Wants (30%):</strong> KSh {budgetData.wants.toLocaleString()}</li>
                    <li><strong>Savings/Debt (20%):</strong> KSh {budgetData.savings.toLocaleString()}</li>
                  </ul>
                  <hr style={{ margin: '16px 0', borderColor: '#d0e0d0' }} />
                  <p><strong>Your current surplus/deficit:</strong> KSh {budgetData.remaining.toLocaleString()}</p>
                  {budgetData.isOverSpending ? (
                    <p style={{ color: '#b33' }}>⚠️ You're overspending. Consider reducing variable expenses.</p>
                  ) : (
                    <p style={{ color: 'var(--primary)' }}>✅ You have room to save more!</p>
                  )}
                  <button 
                    className="btn btn-outline" 
                    onClick={() => window.print()}
                    style={{ marginTop: '16px' }}
                  >
                    <i className="fas fa-print"></i> Print Budget
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======== SAVINGS PLANNER ======== */}
      <section id="planner">
        <div className="container">
          <h2 className="section-title text-center">
            <i className="fas fa-bullseye"></i> Savings Goal Planner
          </h2>
          <p className="section-sub text-center mx-auto">
            Set a goal and see how long it will take to reach it.
          </p>
          <div className="planner-grid">
            <div className="planner-card">
              <h3>Set Your Goal</h3>
              <div className="form-group">
                <label>Goal Amount (KSh)</label>
                <input 
                  type="number" 
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  placeholder="e.g. 100000"
                />
              </div>
              <div className="form-group">
                <label>Monthly Savings (KSh)</label>
                <input 
                  type="number" 
                  value={monthlySave}
                  onChange={(e) => setMonthlySave(Number(e.target.value))}
                  placeholder="e.g. 10000"
                />
              </div>
              <button className="btn btn-accent" onClick={handleCalculatePlan}>
                <i className="fas fa-clock"></i> Calculate Timeline
              </button>
            </div>
            <div className="planner-card">
              <h3>Your Progress</h3>
              {planResult ? (
                <div>
                  <p>
                    <i className="fas fa-calendar-check" style={{ color: 'var(--primary)' }}></i>
                    <strong> You'll reach your goal in {planResult.timeStr}.</strong>
                  </p>
                  <p style={{ color: 'var(--text-muted)' }}>
                    Saving KSh {monthlySave.toLocaleString()} monthly toward KSh {goalAmount.toLocaleString()}.
                  </p>
                  <p className="total-saved">
                    💰 Total saved after {planResult.months} months: KSh {planResult.totalSaved.toLocaleString()}
                  </p>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Enter your goal and monthly savings to see the plan.</p>
              )}
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <p style={{ fontWeight: '500' }}>{Math.round(progress)}% achieved</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======== INVESTMENT CALCULATOR ======== */}
      <section id="invest">
        <div className="container">
          <h2 className="section-title text-center">
            <i className="fas fa-chart-line"></i> Investment Calculator
          </h2>
          <p className="section-sub text-center mx-auto">
            See how your money grows with compound interest.
          </p>
          <div className="calc-box">
            <div className="form-group">
              <label>Initial Investment (KSh)</label>
              <input type="number" id="initialInvestment" placeholder="e.g. 10000" defaultValue="10000" />
            </div>
            <div className="form-group">
              <label>Monthly Contribution (KSh)</label>
              <input type="number" id="monthlyContribution" placeholder="e.g. 5000" defaultValue="5000" />
            </div>
            <div className="form-group">
              <label>Annual Interest Rate (%)</label>
              <input type="number" id="interestRate" placeholder="e.g. 12" defaultValue="12" />
            </div>
            <div className="form-group">
              <label>Investment Period (Years)</label>
              <input type="number" id="investmentYears" placeholder="e.g. 10" defaultValue="10" />
            </div>
            <button className="btn" onClick={calculateInvestment}>
              <i className="fas fa-calculator"></i> Calculate Returns
            </button>
            {investResult && (
              <div className="calc-result show">
                <p><strong>💰 Investment Results</strong></p>
                <ul style={{ listStyle: 'none', marginTop: '10px' }}>
                  <li><strong>Total Invested:</strong> KSh {investResult.totalInvested.toLocaleString()}</li>
                  <li><strong>Total Value:</strong> KSh {investResult.total.toLocaleString()}</li>
                  <li><strong>Total Earnings:</strong> KSh {investResult.totalEarnings.toLocaleString()}</li>
                  <li><strong>Return on Investment:</strong> {investResult.roi.toFixed(1)}%</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======== RESOURCES ======== */}
      <section id="resources">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-podcast"></i> Resources & Downloads
          </h2>
          <p className="section-sub">
            Curated books, podcasts, templates, and expert tips to deepen your financial literacy.
          </p>
          <div className="card-grid">
            <div className="card">
              <i className="fas fa-book-open"></i>
              <h3>Books</h3>
              <p>"The Richest Man in Babylon", "Atomic Habits", "Smart Money Tribe".</p>
            </div>
            <div className="card">
              <i className="fas fa-headphones"></i>
              <h3>Podcasts</h3>
              <p>MoneyMentor Talk, The Kenya Finance Show, The Side Hustle Nation.</p>
            </div>
            <div className="card">
              <i className="fas fa-file-excel"></i>
              <h3>Templates</h3>
              <p>
                <a href="/downloads/budget.xlsx" download>
  Download Excel Budget
</a>

<a href="/downloads/tracker.pdf" download>
  PDF Tracker
</a>
              </p>
            </div>
            <div className="card">
              <i className="fas fa-lightbulb"></i>
              <h3>Quick Tips</h3>
              <p>Pay yourself first. Track every expense. Start an emergency fund today.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FAQ ======== */}
      <section id="faq">
        <div className="container">
          <h2 className="section-title text-center">
            <i className="fas fa-question-circle"></i> Frequently Asked Questions
          </h2>
          <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            {[
              {
                q: "What is the 50/30/20 rule?",
                a: "It's a simple budgeting framework: 50% of your income goes to needs, 30% to wants, and 20% to savings and debt repayment."
              },
              {
                q: "How much should I have in an emergency fund?",
                a: "Aim for 3–6 months of living expenses. Start with a small goal like KSh 10,000 and build from there."
              },
              {
                q: "What's the best investment for beginners in Kenya?",
                a: "Money Market Funds (MMFs) and Treasury Bills are great low-risk starting points. They're accessible and liquid."
              },
              {
                q: "How does compound interest work?",
                a: "Compound interest is interest earned on both your initial investment and the interest already earned. It's like a snowball effect for your money!"
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="faq-item" 
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <i className={`fas ${openFaq === index ? 'fa-minus' : 'fa-plus'}`}></i>
                </div>
                <div className={`faq-answer ${openFaq === index ? 'open' : ''}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

 {/* ======== EXPENSE TRACKER ======== */}
      <ExpenseTracker />

      {/* ======== CONTACT / ASK AN EXPERT ======== */}
      <section id="contact">
        <div className="container">
          <h2 className="section-title text-center">
            <i className="fas fa-envelope-open-text"></i> Ask an Expert
          </h2>
          <p className="section-sub text-center mx-auto">
            Have a financial question? Submit it below and our team will get back to you within 48 hours.
          </p>
          <div className="contact-form">
            {formSubmitted ? (
              <div className="success-message">
                <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#2e7d32' }}></i>
                <h3 style={{ marginTop: '16px', color: '#2e7d32' }}>✅ Your question has been sent!</h3>
                <p style={{ color: 'var(--text-muted)' }}>We'll reply within 48 hours.</p>
                <button 
                  className="btn" 
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({ name: '', email: '', question: '' });
                  }}
                  style={{ marginTop: '16px' }}
                >
                  Send Another Question
                </button>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Your Name <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Jane Muthoni"
                    style={{ borderColor: formErrors.name ? 'red' : '' }}
                  />
                  {formErrors.name && <p className="error-text">{formErrors.name}</p>}
                </div>
                <div className="form-group">
                  <label>Email Address <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="jane@example.com"
                    style={{ borderColor: formErrors.email ? 'red' : '' }}
                  />
                  {formErrors.email && <p className="error-text">{formErrors.email}</p>}
                </div>
                <div className="form-group">
                  <label>Your Question <span style={{ color: 'red' }}>*</span></label>
                  <textarea 
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    placeholder="I'd like to know more about..."
                    style={{ borderColor: formErrors.question ? 'red' : '' }}
                  ></textarea>
                  {formErrors.question && <p className="error-text">{formErrors.question}</p>}
                </div>
                <button className="btn" onClick={handleSubmitForm}>
                  <i className="fas fa-paper-plane"></i> Send Message
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer>
        <div className="container footer-flex">
          <p>&copy; 2026 MoneyMentor Kenya — Empowering young Africans with financial wisdom.</p>
          <div className="social">
            <i className="fab fa-twitter"></i>
            <i className="fab fa-instagram"></i>
            <i className="fab fa-youtube"></i>
            <i className="fab fa-tiktok"></i>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;