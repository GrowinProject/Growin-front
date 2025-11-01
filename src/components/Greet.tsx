// src/components/Greet.tsx
type GreetProps = {
    name?: string;
  };
  
  export default function Greet({ name = "World" }: GreetProps) {
    return <p>안녕, {name}! 👋</p>;
  }
  