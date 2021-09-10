import { useRef } from 'react';

const Form = (props) => {

    const nationValue = useRef(null);

    return ( 
        <form>
            <label htmlFor="nations-select">Choose a Nation:</label>
            <select ref={nationValue} name="nations" id="nations-select" required>
                <option value="s">S Tier</option>
                <option value="a">A Tier</option>
                <option value="b">B Tier</option>
                <option value="c">C Tier</option>
                <option value="d">D Tier</option>
                <option value="e">E Tier</option>
                <option value="f">F Tier</option>
            </select>
            <button onClick={props.onClick} className="generate">Generate</button>
        </form>
     );
}
 
export default Form;