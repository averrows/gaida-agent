"use client"

import { CreateMessage, Message, useChat } from "ai/react"
import { useQuery } from "@tanstack/react-query"
import { Chat } from "@/components/ui/chat"
import { GetTargetRecruitPayload } from "./api/recruits/target/route"
import { GetInterviewsPayload } from "./api/recruits/interviews/route"
import { ChatRequestOptions } from "@ai-sdk/ui-utils"

export default function ChatWithSuggestions() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    stop,
  } = useChat()

  const { data: recruits, isLoading: recruitsLoading, refetch: refetchRecruits } = useQuery({
    queryKey: ['recruits'],
    queryFn: async () => {
      console.log('fetching recruits')
      const recruits = await fetch('/api/recruits/target').then(res => res.json() as Promise<GetTargetRecruitPayload[]>);
      return recruits;
    },
    refetchInterval: 1000,
    notifyOnChangeProps: ['data']
  })

  const { data: interviews, isLoading: interviewsLoading, refetch: refetchInterviews } = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const interviews = await fetch('/api/recruits/interviews').then(res => res.json() as Promise<GetInterviewsPayload[]>);
      return interviews;
    },
    refetchInterval: 1000,
    notifyOnChangeProps: ['data']
  })

  return <div className="h-screen max-h-screen w-screen grid grid-cols-10 justify-center gap-2 items-center p-10">
    < div className="col-span-7 bg-gray-100 rounded-lg p-4 h-full max-h-full overflow-y-auto" >
      <Chat
        className="h-full max-h-full overflow-y-auto"
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={(event, options) => {
          handleSubmit(event, options);
        }}
        isGenerating={isLoading}
        stop={stop}
        append={async (message: Message | CreateMessage, options?: ChatRequestOptions) => {
          const result = await append(message, options);
          console.log(result);
          return result;
        }}
        suggestions={[
          "Cari target recruit yang belum pernah diinterview",
          "Tambahkan target recruit baru",
          "Buat interview untuk target recruit",
        ]}
      />
    </div >
    <div className="col-span-3 h-screen">
      <div className="bg-gray-100 rounded-lg p-4 h-full sticky top-0 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold mb-4">Target Recruits</h2>
          {recruitsLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">LinkedIn</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recruits?.map((recruit) => (
                  <tr key={recruit.id} className="border-b hover:bg-gray-200">
                    <td className="p-2">{recruit.name}</td>
                    <td className="p-2">
                      <a
                        href={recruit.linkedinProfileUrl ?? ''}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Profile
                      </a>
                    </td>
                    <td className="p-2">
                      {recruit.recruitmentStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold mb-4">Interviews</h2>
          {interviewsLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid gap-4">
              {interviews?.map((interview) => (
                <div key={interview.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500">Interview #{interview.id}</div>
                    <div className="text-sm text-gray-500">Target ID: {interview.targetRecruitId}</div>
                    <div className="text-sm text-gray-500">Target Name: {interview.targetRecruitName}</div>
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Join Meeting
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div >
}
