export interface Controller {
  id: number;
  title: string;
  location: string;
}

const controllerData: Controller[] = [
  { id: 1, title: "제어기 1", location: "#공장위치" },
  { id: 2, title: "제어기 2", location: "#공장위치" },
  { id: 3, title: "제어기 3", location: "#공장위치 #공장위치" },
  { id: 4, title: "제어기 4", location: "#공장위치" },
];

export default controllerData;
