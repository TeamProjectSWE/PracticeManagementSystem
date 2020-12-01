import React, {useState} from 'react';
import PropTypes from 'prop-types';

/* Icon Import */
import {
  mdiLightbulbOnOutline,
  mdiEyeOutline,
  mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";

/* Design Import */
import './SimpleTable.scss';
import Tag from "../Tag";
import {AddTags} from "../../pages";
import {SimpleModal} from "../index";
import {render} from "@testing-library/react";

const SimpleTable = props => {
  /* Props */
  const { heads, bodys, search, customEvent, infoEvent, deleteEvent, infoModal } = props;

  /* Const */

  /* Method */
  const searchFilter = () => {
    if(search === undefined || search === '') return null;
  };

  const printHeads = () => {
    return (
      <tr>
        {heads.map((head) => {
          return (<th data-id={ head.id }>{ head.label }</th>);
        })}
        <th>Actions</th>
      </tr>
    );
  };
  const printBodys = () => {
    return bodys.map((body) => {
      return (
        <tr>
          {heads.map((head) => {
            return printBody(body, head.id);
          })}
          {printActions(body.code)}
        </tr>
      );
    });
  };
  const printBody = (body, id) => {
    if(id === 'tags'){
      return printTags(body[id]);
    }
    return (<td>{ body[id] }</td>);
  };
  const printTags = (tags) => {
    return (
      <td>
        {tags.map((tag) => {
          return <Tag code={tag.code} size={0.7} />;
        })}
      </td>
    );
  };
  const printActions = (code) => {
    return (
      <td>
        {typeof customEvent === 'function' ? <button onClick={() => { customEvent(code) }} className={'icon_btn'}><Icon className="icon" path={ mdiLightbulbOnOutline } size={0.7}/></button> : null}
        {typeof infoEvent === 'function' ? <button onClick={() => { infoEvent(code) }} className={'icon_btn'}><Icon className="icon" path={ mdiEyeOutline } size={0.7}/></button> : null}
        {typeof deleteEvent === 'function' ? <button onClick={() => { deleteEvent(code) }} className={'icon_btn'}><Icon className="icon" path={ mdiTrashCanOutline } size={0.7}/></button> : null}
      </td>
    );
  }

  searchFilter();

  return (
    <div className={'simple_table'}>
      <table>
        <thead>
        {printHeads()}
        </thead>
        <tbody>
        {printBodys()}
        </tbody>
      </table>
      <div>
        {infoModal !== 'undefined' ? infoModal : null}
      </div>
    </div>
  );
};

SimpleTable.propTypes = {
  heads: PropTypes.array.isRequired,
  bodys: PropTypes.array.isRequired,
  search: PropTypes.string,
  customEvent: PropTypes.func,
  infoEvent: PropTypes.func,
  deleteEvent: PropTypes.func,
  infoModal: PropTypes.element
};


export default SimpleTable;
