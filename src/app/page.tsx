export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#004B87] mb-6">
        Welcome to AAA Customer Service Portal
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#004B87] mb-2">Quick Stats</h2>
          <p className="text-gray-600">View your daily performance metrics</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#004B87] mb-2">Recent Activity</h2>
          <p className="text-gray-600">See your latest transactions</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#004B87] mb-2">Announcements</h2>
          <p className="text-gray-600">Important updates and news</p>
        </div>
      </div>
    </div>
  );
}