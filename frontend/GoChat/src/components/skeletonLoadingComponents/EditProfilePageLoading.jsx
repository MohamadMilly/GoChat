import Button from "../ui/Button";

export function EditProfilePageLoading() {
  return (
    <>
      <div className="bg-gray-50/30 px-4 py-2 my-4 flex-0 shrink-0 h-full">
        <label className="text-sm text-cyan-600/80">Your Avatar</label>
        <div className="shrink-0 my-3 flex justify-center">
          <div className="w-[80px] h-[80px] bg-gray-200 animate-pulse rounded-full"></div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            disabled={true}
            className={"text-xs bg-white disabled:opacity-50"}
          >
            Replace
          </Button>
          <Button
            disabled={true}
            className={"bg-red-200 text-red-500/80 text-xs disabled:opacity-50"}
          >
            Delete
          </Button>
        </div>
      </div>
      {/* second part */}
      <div className="flex-1 basis-sm relative overflow-hidden h-48">
        <div className="inset-0 absolute bg-gray-800/40 animate-pulse"></div>
        <div className="z-10 relative h-full w-full flex justify-center items-center flex-col gap-2">
          <label className="text-2xl text-white text-shadow-sm">
            Your Avatar Background
          </label>

          <div className="flex items-center gap-2">
            <Button
              disabled={true}
              className={"text-xs bg-gray-50 disabled:opacity-50"}
            >
              Replace
            </Button>
            <Button
              disabled={true}
              className={
                "bg-red-200 text-red-500/80 text-xs disabled:opacity-50"
              }
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
