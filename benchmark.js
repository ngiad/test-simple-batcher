// benchmark.js
import { check, sleep } from 'k6';
import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { Trend } from 'k6/metrics';


// Danh sách ID dùng chung cho tất cả VUs
const ids = new SharedArray('ids', () => [
  '67d0feeebc9094ee5417de2d', '67d0feeebc9094ee5417de2e', '67d0feeebc9094ee5417de2f',
  '67d0feeebc9094ee5417de30', '67d0feeebc9094ee5417de31', '67d0feeebc9094ee5417de32',
  '67d0feeebc9094ee5417de33', '67d0feeebc9094ee5417de34', '67d0feeebc9094ee5417de35',
  '67d0feeebc9094ee5417de36', '67d0feeebc9094ee5417de37', '67d0feeebc9094ee5417de38',
  '67d0feeebc9094ee5417de39', '67d0feeebc9094ee5417de3a', '67d0feeebc9094ee5417de3b',
  '67d0feeebc9094ee5417de3c', '67d0feeebc9094ee5417de3d', '67d0feeebc9094ee5417de3e',
  '67d0feeebc9094ee5417de3f', '67d0feeebc9094ee5417de40', '67d0feeebc9094ee5417de41',
  '67d0feeebc9094ee5417de42', '67d0feeebc9094ee5417de43', '67d0feeebc9094ee5417de44',
  '67d0feeebc9094ee5417de45', '67d0feeebc9094ee5417de46', '67d0feeebc9094ee5417de47',
  '67d0feeebc9094ee5417de48', '67d0feeebc9094ee5417de49', '67d0feeebc9094ee5417de4a'
]);

// Cấu hình test
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up đến 50 users trong 30s
    { duration: '1m', target: 100 },  // Duy trì 100 users trong 1 phút
    { duration: '30s', target: 0 },   // Ramp-down về 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Tỷ lệ lỗi < 1%
    http_req_duration: ['p(95)<500'], // 95% request < 1500ms
  },
};

// Custom metrics
const responseTimeTrend = new Trend('response_time');

export default function () {
  // Chọn ID ngẫu nhiên
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  const url = `http://localhost:3000/api/dataloader/${randomId}`;

  // Gửi request
  const res = http.get(url, {
    tags: { name: 'GetData' },
  });

  // Theo dõi response time
  responseTimeTrend.add(res.timings.duration);

  // Kiểm tra kết quả
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has data': (r) => {
      if (r.status === 200 && r.body) {
        try {
          const jsonResponse = JSON.parse(r.body);
          return jsonResponse.data !== null;
        } catch (error) {
          console.error('Error parsing JSON:', error);
          return false;
        }
      }
      return false;
    }
  });

  // Thêm delay giữa các request
  sleep(0.5);
}