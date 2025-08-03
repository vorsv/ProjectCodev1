class CodePlatform {
    constructor() {
        this.apiBase = '/codeplatform/backend/api';
        this.currentUser = null;
        this.currentProblem = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                this.login(formData.get('username'), formData.get('password'));
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                this.register(
                    formData.get('username'),
                    formData.get('email'),
                    formData.get('password'),
                    formData.get('full_name')
                );
            });
        }

        // Show register form
        const showRegisterBtn = document.getElementById('show-register');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }

        // Show login form
        const showLoginBtn = document.getElementById('show-login');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Tab navigation
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTab(e.target.dataset.tab);
            });
        });

        // Code submission
        const submitBtn = document.getElementById('submit-code');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitCode();
            });
        }
    }

    async checkAuth() {
        try {
            const response = await fetch(`${this.apiBase}/auth/check.php`);
            const data = await response.json();
            
            if (data.authenticated) {
                this.currentUser = data.user;
                this.showDashboard();
            } else {
                this.showLogin();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLogin();
        }
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/auth/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                this.showDashboard();
                this.showSuccess('Login successful!');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showError('Login failed: ' + error.message);
        }
    }

    async register(username, email, password, full_name) {
        try {
            const response = await fetch(`${this.apiBase}/auth/register.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, full_name })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('Registration successful! You can now login.');
                this.showLoginForm();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showError('Registration failed: ' + error.message);
        }
    }

    async logout() {
        try {
            await fetch(`${this.apiBase}/auth/logout.php`, { method: 'POST' });
            this.currentUser = null;
            this.showLogin();
            this.showSuccess('Logged out successfully!');
        } catch (error) {
            this.showError('Logout failed');
        }
    }

    showLogin() {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('register-container').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'none';
    }

    showRegisterForm() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('register-container').style.display = 'block';
        document.getElementById('dashboard-container').style.display = 'none';
    }

    showLoginForm() {
        document.getElementById('register-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('dashboard-container').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('register-container').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'block';
        this.loadProblems();
    }

    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        // Load tab content
        switch(tabName) {
            case 'problems':
                this.loadProblems();
                break;
            case 'submissions':
                this.loadSubmissions();
                break;
            case 'leaderboard':
                this.loadLeaderboard();
                break;
        }
    }

    async loadProblems() {
        try {
            const response = await fetch(`${this.apiBase}/problems/list.php`);
            const data = await response.json();
            
            if (data.success) {
                this.displayProblems(data.problems);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Failed to load problems:', error);
            this.showError('Failed to load problems: ' + error.message);
        }
    }

    displayProblems(problems) {
        const problemsList = document.getElementById('problems-list');
        if (!problemsList) return;

        if (problems.length === 0) {
            problemsList.innerHTML = '<p class="text-center text-gray-600">No problems available yet.</p>';
            return;
        }

        problemsList.innerHTML = problems.map(problem => `
            <div class="problem-item" onclick="app.openProblem(${problem.id})">
                <div class="problem-title">${problem.title}</div>
                <div class="problem-meta">
                    <span class="difficulty ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
                    <span class="category">${problem.category_name || 'General'}</span>
                    <span class="stats">${problem.total_submissions || 0} submissions</span>
                </div>
                <div class="problem-description">${problem.description.substring(0, 150)}...</div>
            </div>
        `).join('');
    }

    async openProblem(problemId) {
        try {
            const response = await fetch(`${this.apiBase}/problems/detail.php?id=${problemId}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentProblem = data.problem;
                this.showCodeEditor();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showError('Failed to load problem details: ' + error.message);
        }
    }

    showCodeEditor() {
        if (!this.currentProblem) return;

        // Hide problems list
        document.getElementById('problems-tab').style.display = 'none';
        
        // Show code editor
        const editor = document.getElementById('code-editor');
        editor.style.display = 'block';

        // Set problem details
        document.getElementById('problem-title').textContent = this.currentProblem.title;
        
        let problemHtml = `
            <h3>${this.currentProblem.title}</h3>
            <div class="problem-meta">
                <span class="difficulty ${this.currentProblem.difficulty.toLowerCase()}">${this.currentProblem.difficulty}</span>
                <span>Time Limit: ${this.currentProblem.time_limit}ms</span>
                <span>Memory Limit: ${this.currentProblem.memory_limit}MB</span>
            </div>
            <div class="problem-text">${this.currentProblem.description.replace(/\n/g, '<br>')}</div>
        `;

        if (this.currentProblem.input_format) {
            problemHtml += `<h4>Input Format:</h4><p>${this.currentProblem.input_format.replace(/\n/g, '<br>')}</p>`;
        }

        if (this.currentProblem.output_format) {
            problemHtml += `<h4>Output Format:</h4><p>${this.currentProblem.output_format.replace(/\n/g, '<br>')}</p>`;
        }

        if (this.currentProblem.constraints) {
            problemHtml += `<h4>Constraints:</h4><p>${this.currentProblem.constraints.replace(/\n/g, '<br>')}</p>`;
        }

        if (this.currentProblem.sample_cases && this.currentProblem.sample_cases.length > 0) {
            problemHtml += '<h4>Sample Test Cases:</h4>';
            this.currentProblem.sample_cases.forEach((testCase, index) => {
                problemHtml += `
                    <div class="sample-case">
                        <h5>Sample ${index + 1}:</h5>
                        <div class="sample-input">
                            <strong>Input:</strong>
                            <pre>${testCase.input}</pre>
                        </div>
                        <div class="sample-output">
                            <strong>Output:</strong>
                            <pre>${testCase.expected_output}</pre>
                        </div>
                    </div>
                `;
            });
        }

        document.getElementById('problem-description').innerHTML = problemHtml;

        // Load code template
        this.loadCodeTemplate();
    }

    loadCodeTemplate() {
        const languageSelect = document.getElementById('language-select');
        const codeTextarea = document.getElementById('code-textarea');
        
        const templates = {
            '1': `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
            '2': `# Your Python solution here
def solve():
    pass

if __name__ == "__main__":
    solve()`,
            '3': `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
    }
}`,
            '4': `<?php
// Your PHP solution here

?>`
        };

        languageSelect.addEventListener('change', () => {
            const template = templates[languageSelect.value];
            if (template && codeTextarea.value.trim() === '') {
                codeTextarea.value = template;
            }
        });

        // Set initial template
        codeTextarea.value = templates['1'];
    }

    async submitCode() {
        if (!this.currentProblem) return;

        const languageId = document.getElementById('language-select').value;
        const sourceCode = document.getElementById('code-textarea').value;

        if (!sourceCode.trim()) {
            this.showError('Please write some code before submitting');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/submissions/submit.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problem_id: this.currentProblem.id,
                    language_id: languageId,
                    source_code: sourceCode
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('Code submitted successfully!');
                this.pollSubmissionStatus(data.submission_id);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showError('Submission failed: ' + error.message);
        }
    }

    async pollSubmissionStatus(submissionId) {
        const resultContainer = document.getElementById('submission-result');
        resultContainer.innerHTML = '<div class="loading"></div> Judging your submission...';

        const pollInterval = 2000; // 2 seconds
        const maxPolls = 30; // 1 minute max
        let polls = 0;

        const poll = async () => {
            try {
                const response = await fetch(`${this.apiBase}/submissions/status.php?id=${submissionId}`);
                const data = await response.json();

                if (data.status !== 'Pending' && data.status !== 'Running') {
                    this.displaySubmissionResult(data);
                    return;
                }

                polls++;
                if (polls < maxPolls) {
                    setTimeout(poll, pollInterval);
                } else {
                    resultContainer.innerHTML = '<div class="result error">Submission taking too long to judge</div>';
                }
            } catch (error) {
                console.error('Error polling submission status:', error);
                resultContainer.innerHTML = '<div class="result error">Error checking submission status</div>';
            }
        };

        poll();
    }

    displaySubmissionResult(submission) {
        const resultContainer = document.getElementById('submission-result');
        const statusClass = submission.status === 'Accepted' ? 'success' : 'error';
        
        resultContainer.innerHTML = `
            <div class="result ${statusClass}">
                <h3>Submission Result</h3>
                <p><strong>Status:</strong> ${submission.status}</p>
                <p><strong>Score:</strong> ${submission.score || 0}</p>
                <p><strong>Execution Time:</strong> ${submission.execution_time || 0}ms</p>
                <p><strong>Memory Used:</strong> ${submission.memory_used || 0}KB</p>
                ${submission.status !== 'Accepted' ? `<p><strong>Details:</strong> ${submission.error_message || 'Check your solution'}</p>` : ''}
            </div>
        `;
    }

    loadSubmissions() {
        // Placeholder for submissions tab
        const submissionsTab = document.getElementById('submissions-tab');
        if (submissionsTab) {
            submissionsTab.innerHTML = '<p class="text-center text-gray-600">Submissions history will be displayed here.</p>';
        }
    }

    loadLeaderboard() {
        // Placeholder for leaderboard tab
        const leaderboardTab = document.getElementById('leaderboard-tab');
        if (leaderboardTab) {
            leaderboardTab.innerHTML = '<p class="text-center text-gray-600">Leaderboard will be displayed here.</p>';
        }
    }

    showError(message) {
        this.showAlert(message, 'error');
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => alert.remove(), 5000);
    }
}

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CodePlatform();
});