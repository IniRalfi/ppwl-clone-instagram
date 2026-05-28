import { apiClient } from "./api.client";
import { UserStoryGroup } from "../components/story/StoriesRow";

/** Ambil semua cerita aktif dari diri sendiri & teman yang diikuti */
export async function getActiveStories(): Promise<UserStoryGroup[]> {
  const res = await apiClient.get<{ data: UserStoryGroup[] }>("/stories");
  return res.data || [];
}

/** Unggah cerita baru */
export async function uploadStory(imageFile: File): Promise<any> {
  const formData = new FormData();
  formData.append("image", imageFile);
  return await apiClient.postForm<any>("/stories", formData);
}
