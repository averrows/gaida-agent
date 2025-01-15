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

  // const { data: recruits, isLoading: recruitsLoading, refetch: refetchRecruits } = useQuery({
  //   queryKey: ['recruits'],
  //   queryFn: async () => {
  //     console.log('fetching recruits')
  //     const recruits = await fetch('/api/recruits/target').then(res => res.json() as Promise<GetTargetRecruitPayload[]>);
  //     return recruits;
  //   },
  //   refetchInterval: 1000,
  //   notifyOnChangeProps: ['data']
  // })

  // const { data: interviews, isLoading: interviewsLoading, refetch: refetchInterviews } = useQuery({
  //   queryKey: ['interviews'],
  //   queryFn: async () => {
  //     const interviews = await fetch('/api/recruits/interviews').then(res => res.json() as Promise<GetInterviewsPayload[]>);
  //     return interviews;
  //   },
  //   refetchInterval: 1000,
  //   notifyOnChangeProps: ['data']
  // })

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
          return result;
        }}
        suggestions={[
          "Cari target recruit yang belum pernah diinterview",
          "Tambahkan target recruit baru",
          "Buat interview untuk target recruit",
        ]}
      />
    </div >
  </div>
}
