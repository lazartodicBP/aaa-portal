export default function TestPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold text-aaa-blue">Tailwind Test Page</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-aaa-blue text-white p-4 rounded">
          AAA Blue Background
        </div>
        <div className="bg-aaa-red text-white p-4 rounded">
          AAA Red Background
        </div>
        <div className="bg-aaa-yellow text-aaa-blue p-4 rounded">
          AAA Yellow Background
        </div>
      </div>

      <div className="bg-white border-2 border-aaa-blue p-4 rounded-lg shadow-lg">
        <p className="text-gray-700">This should have a blue border and shadow</p>
      </div>

      <button className="bg-aaa-blue hover:bg-aaa-darkblue text-white font-bold py-2 px-4 rounded transition-colors">
        Test Button
      </button>
    </div>
  );
}