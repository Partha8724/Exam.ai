#!/usr/bin/env python3

import requests
import sys
import json
import uuid
from datetime import datetime
import time

class ExamPrepAPITester:
    def __init__(self, base_url="https://exam-prep-hub-302.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if self.session_token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Expected {expected_status}, got {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'No error details')}"
                except:
                    details += f" - {response.text[:100]}"
            
            self.log_test(name, success, details if not success else "")
            
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def create_test_session(self):
        """Create a test user and session in MongoDB for testing"""
        print("\n🔧 Setting up test user and session...")
        
        # Generate test data
        timestamp = int(time.time())
        self.user_id = f"test-user-{timestamp}"
        self.session_token = f"test_session_{timestamp}"
        test_email = f"test.user.{timestamp}@example.com"
        
        # MongoDB commands to create test user and session
        mongo_commands = f"""
use('test_database');
db.users.insertOne({{
  user_id: '{self.user_id}',
  email: '{test_email}',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  role: 'student',
  created_at: new Date().toISOString()
}});
db.user_sessions.insertOne({{
  user_id: '{self.user_id}',
  session_token: '{self.session_token}',
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date().toISOString()
}});
print('Test user and session created successfully');
"""
        
        try:
            import subprocess
            result = subprocess.run(['mongosh', '--eval', mongo_commands], 
                                  capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                print(f"✅ Test user created: {self.user_id}")
                print(f"✅ Session token: {self.session_token}")
                return True
            else:
                print(f"❌ MongoDB setup failed: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ MongoDB setup exception: {e}")
            return False

    def cleanup_test_data(self):
        """Clean up test data from MongoDB"""
        print("\n🧹 Cleaning up test data...")
        
        mongo_commands = f"""
use('test_database');
db.users.deleteMany({{email: /test\\.user\\./}});
db.user_sessions.deleteMany({{session_token: /test_session/}});
db.questions.deleteMany({{question_id: /test_q_/}});
db.mock_tests.deleteMany({{user_id: '{self.user_id}'}});
db.study_materials.deleteMany({{user_id: '{self.user_id}'}});
db.student_progress.deleteMany({{user_id: '{self.user_id}'}});
db.chat_history.deleteMany({{user_id: '{self.user_id}'}});
db.interview_prep.deleteMany({{user_id: '{self.user_id}'}});
print('Test data cleaned up');
"""
        
        try:
            import subprocess
            subprocess.run(['mongosh', '--eval', mongo_commands], 
                          capture_output=True, text=True, timeout=30)
            print("✅ Test data cleaned up")
        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n📋 Testing Authentication Endpoints...")
        
        # Test /auth/me without token (should return 401)
        self.run_test("Auth Me - Unauthenticated", "GET", "auth/me", 401)
        
        # Test /auth/me with valid token (should return 200)
        self.run_test("Auth Me - Authenticated", "GET", "auth/me", 200)
        
        # Test session endpoint exists
        self.run_test("Auth Session Endpoint", "POST", "auth/session", 400, 
                     data={"session_id": "invalid"})

    def test_questions_endpoints(self):
        """Test questions endpoints"""
        print("\n📋 Testing Questions Endpoints...")
        
        # Test get questions
        self.run_test("Get Questions", "GET", "questions", 200)
        
        # Test generate questions
        success, response = self.run_test("Generate Questions", "POST", "questions/generate", 200,
                                        data={"exam_type": "UPSC", "subject": "History", "count": 2})
        
        if success and response.get('questions'):
            print(f"   Generated {len(response['questions'])} questions")

    def test_mock_tests_endpoints(self):
        """Test mock tests endpoints"""
        print("\n📋 Testing Mock Tests Endpoints...")
        
        # First generate some questions for testing
        self.run_test("Generate Test Questions", "POST", "questions/generate", 200,
                     data={"exam_type": "UPSC", "subject": "Geography", "count": 3})
        
        # Test create mock test
        success, test_response = self.run_test("Create Mock Test", "POST", "tests/create", 200,
                                             data={"exam_type": "UPSC", "subject": "Geography", "question_count": 2})
        
        if success and test_response.get('test'):
            test_id = test_response['test']['test_id']
            
            # Test get specific test
            self.run_test("Get Test by ID", "GET", f"tests/{test_id}", 200)
            
            # Test submit test
            questions = test_response.get('questions', [])
            if questions:
                answers = {q['question_id']: q['correct_answer'] for q in questions[:1]}
                self.run_test("Submit Test", "POST", f"tests/{test_id}/submit", 200,
                            data={"answers": answers})
        
        # Test get user tests
        self.run_test("Get User Tests", "GET", "tests", 200)

    def test_dashboard_endpoints(self):
        """Test dashboard endpoints"""
        print("\n📋 Testing Dashboard Endpoints...")
        
        self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200)

    def test_analysis_endpoints(self):
        """Test analysis endpoints"""
        print("\n📋 Testing Analysis Endpoints...")
        
        self.run_test("Get Progress", "GET", "analysis/progress", 200)
        self.run_test("Get Recommendations", "GET", "analysis/recommendations", 200)

    def test_ai_chat_endpoints(self):
        """Test AI chat endpoints"""
        print("\n📋 Testing AI Chat Endpoints...")
        
        # Test AI chat
        success, response = self.run_test("AI Teacher Chat", "POST", "ai/chat", 200,
                                        data={"message": "What is Article 370?", "context": "UPSC"})
        
        if success:
            print(f"   AI Response length: {len(response.get('response', ''))}")
        
        # Test chat history
        self.run_test("Get Chat History", "GET", "ai/chat/history", 200)

    def test_interview_endpoints(self):
        """Test interview preparation endpoints"""
        print("\n📋 Testing Interview Endpoints...")
        
        # Test generate interview questions
        success, response = self.run_test("Generate Interview Questions", "POST", "interview/generate", 200,
                                        data={"exam_type": "UPSC", "position": "IAS Officer", "question_type": "general"})
        
        if success and response.get('questions'):
            print(f"   Generated {len(response['questions'])} interview questions")
        
        # Test interview history
        self.run_test("Get Interview History", "GET", "interview/history", 200)

    def test_materials_endpoints(self):
        """Test study materials endpoints"""
        print("\n📋 Testing Study Materials Endpoints...")
        
        # Test get materials
        self.run_test("Get Study Materials", "GET", "materials", 200)
        
        # Note: File upload testing would require multipart/form-data which is complex
        # We'll test the endpoint exists but skip actual file upload
        print("   ⚠️ File upload testing skipped (requires multipart data)")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Exam Prep Hub API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        
        # Setup test environment
        if not self.create_test_session():
            print("❌ Failed to create test session. Aborting tests.")
            return False
        
        try:
            # Run all test suites
            self.test_auth_endpoints()
            self.test_questions_endpoints()
            self.test_mock_tests_endpoints()
            self.test_dashboard_endpoints()
            self.test_analysis_endpoints()
            self.test_ai_chat_endpoints()
            self.test_interview_endpoints()
            self.test_materials_endpoints()
            
        finally:
            # Always cleanup
            self.cleanup_test_data()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ExamPrepAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())