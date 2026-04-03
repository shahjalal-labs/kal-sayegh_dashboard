export default function ToDo() {
  return (
    <div className="px-8 bg-white rounded-2xl py-6">
      <div className="flex justify-between">
        <h2 className="text-lg font-normal">Office To Do List</h2>

        <button className="px-6 py-3 bg-primary text-secondary rounded-xl">
          + Add New Task
        </button>
      </div>
    </div>
  );
}
