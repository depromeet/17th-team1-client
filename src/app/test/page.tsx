export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">배포 테스트</h1>
          <p className="text-gray-600 mb-6">GitHub Actions 자동 배포 테스트</p>

          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Docker 컨테이너 실행 중
            </div>

            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              Next.js 애플리케이션 정상 작동
            </div>

            <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded">
              GCP 서버 배포 완료
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">배포 정보</h3>
            <p className="text-sm text-gray-600">서버: GCP</p>
            <p className="text-sm text-gray-600">배포 시간: {new Date().toLocaleString("ko-KR")}</p>
          </div>

          <div className="mt-6">
            <a
              href="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              메인 페이지로 이동
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
