import React, { useState } from 'react';
import { Users, Code, Trophy, Settings, BookOpen, Play, Upload, User, LogIn } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'instructor' | 'student';
  email: string;
}

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
}

interface Submission {
  id: number;
  problemId: number;
  userId: number;
  language: string;
  code: string;
  status: 'Pending' | 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  score: number;
  submittedAt: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // Mock data
  const problems: Problem[] = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      category: "Arrays",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      timeLimit: 1000,
      memoryLimit: 256
    },
    {
      id: 2,
      title: "Binary Search",
      difficulty: "Medium",
      category: "Algorithms",
      description: "Implement binary search in a sorted array.",
      timeLimit: 2000,
      memoryLimit: 512
    },
    {
      id: 3,
      title: "Graph Traversal",
      difficulty: "Hard",
      category: "Graph Theory",
      description: "Implement depth-first search and breadth-first search for a given graph.",
      timeLimit: 5000,
      memoryLimit: 1024
    }
  ];

  const submissions: Submission[] = [
    {
      id: 1,
      problemId: 1,
      userId: 1,
      language: "cpp",
      code: "#include<iostream>\nusing namespace std;\nint main() { return 0; }",
      status: "Accepted",
      score: 100,
      submittedAt: "2025-01-08 10:30:00"
    }
  ];

  const LoginForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Code className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CodeJudge Platform</h1>
          <p className="text-gray-600">Offline Programming Contest System</p>
        </div>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setCurrentUser({ id: 1, username: 'student1', role: 'student', email: 'student1@test.com' })}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Demo User Roles: 
            <span className="font-medium text-blue-600 ml-1">Admin | Instructor | Student</span>
          </p>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Problems Solved</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ranking</p>
              <p className="text-2xl font-bold text-gray-900">#12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Submissions</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Problem #{submission.problemId}</p>
                  <p className="text-sm text-gray-600">{submission.language.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    submission.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                    submission.status === 'Wrong Answer' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {submission.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">Score: {submission.score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Chart</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Progress visualization would be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ProblemsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Problem Repository</h2>
        <div className="flex gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>All Categories</option>
            <option>Arrays</option>
            <option>Algorithms</option>
            <option>Graph Theory</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>All Difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      </div>
      
      <div className="grid gap-4">
        {problems.map((problem) => (
          <div key={problem.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{problem.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {problem.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{problem.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>Time Limit: {problem.timeLimit}ms</span>
                  <span>Memory Limit: {problem.memoryLimit}MB</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProblem(problem)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Solve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CodeEditor = ({ problem }: { problem: Problem }) => {
    const [code, setCode] = useState('// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}');
    const [language, setLanguage] = useState('cpp');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
      setIsSubmitting(true);
      // Simulate submission process
      setTimeout(() => {
        setIsSubmitting(false);
        alert('Code submitted successfully!');
      }, 2000);
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-screen">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{problem.title}</h2>
            <button
              onClick={() => setSelectedProblem(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {problem.difficulty}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {problem.category}
              </span>
            </div>
            
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem Description</h3>
              <p className="text-gray-700 leading-relaxed mb-4">{problem.description}</p>
              
              <h4 className="font-semibold text-gray-900 mb-2">Constraints:</h4>
              <ul className="text-gray-700 space-y-1 mb-4">
                <li>Time Limit: {problem.timeLimit}ms</li>
                <li>Memory Limit: {problem.memoryLimit}MB</li>
              </ul>
              
              <h4 className="font-semibold text-gray-900 mb-2">Example:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Input:</p>
                <code className="block bg-white p-2 rounded border text-sm">
                  [2,7,11,15], target = 9
                </code>
                <p className="text-sm text-gray-600 mt-4 mb-2">Output:</p>
                <code className="block bg-white p-2 rounded border text-sm">
                  [0,1]
                </code>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Code Editor</h3>
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
              </select>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-900 rounded-lg p-4 font-mono text-sm">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-green-400 resize-none outline-none"
              placeholder="Write your code here..."
            />
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Test Results</h4>
            <div className="text-sm text-gray-600">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Running tests...
                </div>
              ) : (
                <p>Submit your code to see test results</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Leaderboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
            <span>Rank</span>
            <span>Username</span>
            <span>Problems Solved</span>
            <span>Success Rate</span>
            <span>Score</span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((rank) => (
            <div key={rank} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div className="flex items-center gap-2">
                  {rank <= 3 && (
                    <Trophy className={`w-5 h-5 ${
                      rank === 1 ? 'text-yellow-500' :
                      rank === 2 ? 'text-gray-400' :
                      'text-orange-600'
                    }`} />
                  )}
                  <span className="font-medium text-gray-900">#{rank}</span>
                </div>
                <span className="text-gray-900">user{rank}</span>
                <span className="text-gray-600">{50 - rank * 5}</span>
                <span className="text-gray-600">{95 - rank * 2}%</span>
                <span className="text-gray-900 font-medium">{1000 - rank * 50}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return <LoginForm />;
  }

  if (selectedProblem) {
    return <CodeEditor problem={selectedProblem} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">CodeJudge Platform</h1>
            </div>
            
            <nav className="flex space-x-8">
              {['dashboard', 'problems', 'leaderboard', 'submissions', 'admin'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">{currentUser.username}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                  currentUser.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={() => setCurrentUser(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'problems' && <ProblemsTab />}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'submissions' && (
          <div className="text-center py-12">
            <p className="text-gray-600">Submissions management interface would be implemented here</p>
          </div>
        )}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <div className="text-center py-12">
            <p className="text-gray-600">Admin panel for user and system management would be implemented here</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;