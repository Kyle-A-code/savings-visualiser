import CreateDialog from "./createDialog/CreateDialog";

const Empty = () => {
  return <div>
    <h3>Looks like you don't have any buckets yet</h3>
    <p>Create a new bucket to get started</p>
    <CreateDialog />
  </div>;
};

export default Empty;