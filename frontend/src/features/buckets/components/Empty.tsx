import CreateDialog from "./createDialog/CreateDialog";
import "./empty.css";

const Empty = () => {
  return <div className="root">
    <h3>Looks like you don't have any buckets yet</h3>
    <p>Create a new bucket to get started</p>
    <CreateDialog />
  </div>;
};

export default Empty;