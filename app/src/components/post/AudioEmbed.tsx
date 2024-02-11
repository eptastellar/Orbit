"use client"

import { useEffect, useRef, useState } from "react"

import { IconButton, PauseCircle, PlayCircle } from "@/assets/icons"

type Props = {
   src: string
}

const AudioEmbed = ({ src }: Props) => {
   // Interaction states
   const [duration, setDuration] = useState<number>(0)
   const [elapsedTime, setElapsedTime] = useState<number>(0)

   const [isPlaying, setIsPlaying] = useState<boolean>(false)
   const togglePlayPause = () => setIsPlaying((prev) => !prev)

   const audioRef = useRef<HTMLAudioElement>(null)
   const inputRef = useRef<HTMLInputElement>(null)

   useEffect(() => {
      if (isPlaying) audioRef.current?.play()
      else audioRef.current?.pause()
   }, [isPlaying])

   const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      const formattedSeconds = `0${seconds}`.slice(-2)

      return `${minutes}:${formattedSeconds}`
   }

   const handleChange = () => {
      if (audioRef.current && inputRef.current)
         audioRef.current.currentTime = parseFloat(inputRef.current.value)
   }

   return (
      <div className="flex flex-row items-center justify-start gap-4 w-full mt-4 px-4 py-2 bg-gray-5/50 rounded-md">
         {isPlaying
            ? <IconButton icon={<PauseCircle height={32} color="fill-white" />} onClick={togglePlayPause} />
            : <IconButton icon={<PlayCircle height={32} color="fill-white" />} onClick={togglePlayPause} />
         }

         <input
            ref={inputRef}
            type="range"
            step="any"
            max={duration}
            value={elapsedTime}
            onChange={handleChange}
            style={{ backgroundSize: `${(elapsedTime / duration) * 100}% 100%` }}
         />

         <p className="text-xs font-normal text-white">
            {isPlaying
               ? formatTime(elapsedTime)
               : formatTime(duration)
            }
         </p>

         <audio
            ref={audioRef}
            src={src}
            onLoadedMetadata={() => setDuration(audioRef.current!.duration)}
            onTimeUpdate={() => setElapsedTime(audioRef.current!.currentTime)}
            onEnded={() => setIsPlaying(false)}
            hidden
         />
      </div>
   )
}

export default AudioEmbed
