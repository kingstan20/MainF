import {
  CalendarDays,
  Users,
  Lightbulb,
  Trophy,
  MessageSquare,
  ThumbsUp,
  Award,
  LucideProps,
} from 'lucide-react';
import React from 'react';

export const Icons = {
  hackathon: (props: LucideProps) => <CalendarDays {...props} />,
  teammate: (props: LucideProps) => <Users {...props} />,
  collaboration: (props: LucideProps) => <Lightbulb {...props} />,
  fame: (props: LucideProps) => <Trophy {...props} />,
  chat: (props: LucideProps) => <MessageSquare {...props} />,
  congrats: (props: LucideProps) => <Award {...props} />,
  bestOfLuck: (props: LucideProps) => <ThumbsUp {...props} />,
};

export const PostTypeIcon = ({ type, ...props }: { type: string } & LucideProps) => {
  switch (type) {
    case 'HACKATHON':
      return <Icons.hackathon {...props} />;
    case 'TEAMMATE':
      return <Icons.teammate {...props} />;
    case 'COLLABORATION':
      return <Icons.collaboration {...props} />;
    case 'FAME':
      return <Icons.fame {...props} />;
    default:
      return null;
  }
};
