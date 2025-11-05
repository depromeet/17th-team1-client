import { SavedGlobeClient } from "@/components/saved-globe/SavedGlobeClient";
import { getBookmarks } from "@/services/bookmarkService";
import { getServerAuthToken } from "@/utils/serverCookies";

export const dynamic = "force-dynamic";

export default async function SavedGlobePage() {
  try {
    const token = await getServerAuthToken();
    const bookmarks = await getBookmarks(token);

    return <SavedGlobeClient initialBookmarks={bookmarks} />;
  } catch (error) {
    console.error("북마크 로드 실패:", error);

    return <SavedGlobeClient initialBookmarks={[]} />;
  }
}
