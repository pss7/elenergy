import { Routes, Route } from 'react-router-dom';
import Compoents from './components/test/Compoents';


function App() {

  return (
    <Routes>
      <Route path="components-test" element={<Compoents />}></Route>
    </Routes>
  )
}

export default App
