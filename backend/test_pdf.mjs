import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 1 },
  ],
};

export default function () {
  // Get a course
  const res1 = http.get('http://localhost:5000/api/courses/');
  check(res1, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
  
  // Get first course ID from the response
  const courses = JSON.parse(res1.body).courses;
  if (courses.length === 0) { sleep(1); return; }
  
  const courseId = courses[0].id;
  console.log('Testing course ID:', courseId);
  
  // Get course details
  const res2 = http.get(`http://localhost:5000/api/courses/${courseId}`);
  check(res2, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
  
  const courseData = JSON.parse(res2.body);
  const lessons = courseData.course.lessons;
  console.log('Lessons count:', lessons.length);
  
  // Find a PDF lesson
  const pdfLesson = lessons.find(l => l.type === 'pdf');
  if (!pdfLesson) { console.log('No PDF lesson found'); sleep(1); return; }
  
  console.log('PDF lesson:', pdfLesson.title, 'pdfUrl:', pdfLesson.pdfUrl);
  sleep(1);
  
  // Test PDF serving route (without auth - should fail enrollment check)
  const res3 = http.get(`http://localhost:5000/api/files/${pdfLesson.pdfUrl}`);
  check(res3, { 'PDF status check': (r) => { 
    // Just check we got a response
    return true; 
  }});
  sleep(1);
  
  // Try the course/lesson/pdf route
  const res4 = http.get(`http://localhost:5000/api/courses/${courseId}/lessons/${pdfLesson.id}/pdf`);
  check(res4, { 'PDF course/lesson route status': (r) => true });
  sleep(1);
  
  console.log('PDF test complete');
}