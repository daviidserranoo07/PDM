export default interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date: Date;
  location: {
    coords: {
      latitude: number;
      longitude: number;
    };
    address: string;
  };
  priority: string;
  duration: number;
}
