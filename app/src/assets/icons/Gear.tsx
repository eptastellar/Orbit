type Props = {
   color?: string
   height: number
}

const Gear = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={height}
      height={height}
      viewBox="0 0 200 200"
      className={color ?? "fill-current"}
   >
      <path
         d="M100 52.145a47.875 47.875 0 0 0-26.594 8.065 47.842 47.842 0 0 0-7.254 73.628 47.875 47.875 0 0 0 73.647-7.251A47.845 47.845 0 0 0 147.868 100a47.904 47.904 0 0 0-14.036-33.822A47.928 47.928 0 0 0 100 52.145Zm0 73.623a25.775 25.775 0 0 1-23.813-15.907 25.762 25.762 0 0 1 5.588-28.082 25.777 25.777 0 0 1 44 18.221 25.766 25.766 0 0 1-7.55 18.221A25.777 25.777 0 0 1 100 125.768Zm84.688-25.041v-1.454l12.887-16.114a11.045 11.045 0 0 0 2.053-9.746 102.882 102.882 0 0 0-10.337-25.05 11.048 11.048 0 0 0-8.386-5.42l-20.51-2.301-1.021-1.022-2.302-20.513a11.04 11.04 0 0 0-5.422-8.374A102.796 102.796 0 0 0 126.585.36a11.051 11.051 0 0 0-9.739 2.089l-16.119 12.884h-1.454L83.155 2.45A11.048 11.048 0 0 0 73.406.398c-8.774 2.34-17.2 5.83-25.056 10.38a11.045 11.045 0 0 0-5.422 8.338L40.626 39.62l-1.021 1.022-20.519 2.3a11.047 11.047 0 0 0-8.376 5.42A102.754 102.754 0 0 0 .372 73.423a11.04 11.04 0 0 0 2.053 9.737l12.887 16.114v1.454L2.425 116.841a11.042 11.042 0 0 0-2.053 9.746 102.83 102.83 0 0 0 10.393 25.05 11.045 11.045 0 0 0 8.33 5.421l20.51 2.282 1.021 1.021 2.302 20.532a11.043 11.043 0 0 0 5.422 8.374 102.773 102.773 0 0 0 25.065 10.372 11.042 11.042 0 0 0 9.74-2.089l16.118-12.884h1.454l16.119 12.884a11.044 11.044 0 0 0 9.748 2.052 102.872 102.872 0 0 0 25.056-10.335 11.044 11.044 0 0 0 5.441-8.337l2.283-20.504 1.021-1.022 20.519-2.346a11.053 11.053 0 0 0 8.34-5.439 102.79 102.79 0 0 0 10.374-25.06c.441-1.667.485-3.415.128-5.102a11.03 11.03 0 0 0-2.181-4.616l-12.887-16.114Zm-22.203-4.5a64.619 64.619 0 0 1 0 7.546 11.04 11.04 0 0 0 2.403 7.565l11.819 14.77a79.52 79.52 0 0 1-3.986 9.654l-18.806 2.089a11.044 11.044 0 0 0-7.042 3.681 63.428 63.428 0 0 1-5.339 5.338 11.039 11.039 0 0 0-3.682 7.04l-2.081 18.792a79.586 79.586 0 0 1-9.656 4.004l-14.774-11.826a11.052 11.052 0 0 0-6.904-2.411h-.663a64.651 64.651 0 0 1-7.548 0 11.1 11.1 0 0 0-7.567 2.393l-14.774 11.825a79.418 79.418 0 0 1-9.656-3.985l-2.09-18.801a11.043 11.043 0 0 0-3.682-7.04 63.458 63.458 0 0 1-5.34-5.338 11.045 11.045 0 0 0-7.041-3.681l-18.797-2.08a79.527 79.527 0 0 1-4.004-9.654l11.82-14.77a11.043 11.043 0 0 0 2.402-7.565 64.487 64.487 0 0 1 0-7.546 11.042 11.042 0 0 0-2.403-7.565l-11.801-14.77a79.565 79.565 0 0 1 3.986-9.654l18.806-2.09a11.048 11.048 0 0 0 7.042-3.68 63.513 63.513 0 0 1 5.34-5.338 11.043 11.043 0 0 0 3.681-7.04l2.08-18.792a79.618 79.618 0 0 1 9.657-4.004L88.659 35.12a11.103 11.103 0 0 0 7.567 2.393 64.52 64.52 0 0 1 7.548 0 11.05 11.05 0 0 0 7.567-2.393l14.774-11.826a79.582 79.582 0 0 1 9.656 4.004l2.09 18.801a11.043 11.043 0 0 0 3.682 7.04 63.468 63.468 0 0 1 5.339 5.338 11.046 11.046 0 0 0 7.042 3.681l18.797 2.08a79.429 79.429 0 0 1 4.004 9.654l-11.819 14.77a11.04 11.04 0 0 0-2.421 7.565Z"
      />
   </svg>
)
export default Gear
