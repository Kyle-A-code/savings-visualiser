const Empty = () => {
  return <div>
    <h3>Looks like you don't have any buckets yet</h3>
    <p>Create a new bucket to get started</p>
    <button onClick={() => console.log("Create Bucket")}>Create Bucket</button>
  </div>;
};

export default Empty;