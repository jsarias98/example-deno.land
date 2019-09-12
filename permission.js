const { permissions, revokePermission, open, remove, close } = Deno;

(async () => {
  // lookup a permission
  if (!permissions().write) {
    throw new Error("need write permission");
  }

  let log = await open("request.log", "a+");
  let encoder = new TextEncoder();
  await log.write(encoder.encode("hello1\n"));
  await close("request.log")
  console.log('1')
  // revoke some permissions
  revokePermission("read");
  revokePermission("write");
  console.log('2', `write: ${permissions().write}`, `read: ${permissions().read}`)
  log = await open('request.log', "a+")
  // use the log file
  await log.write(encoder.encode("hello2\n"));
  console.log('3')
  // this will prompt for the write permission or fail.
  await remove("request.log");
})();