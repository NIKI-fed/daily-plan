import React from "react";
import "./DataTable.css";
import { groupBy, safeToFixed } from "../utils/utils";

const DataTable = ({ data }) => {

    const groupData = (data) => {
        // Группировка по corporate_person
        const groupedByCorporate = groupBy(data, "corporate_person", "Без категории");
        const sortedCorporate = Object.keys(groupedByCorporate).sort();

        const result = [];

        sortedCorporate.forEach((corporate) => {
            const corporateItems = groupedByCorporate[corporate];

            // Добавляем заголовок группы corporate_person
            result.push({
                type: "corporate_person",
                name: corporate,
                items: corporateItems
            });

            // Добавляем все элементы группы
            corporateItems.forEach((item) => {
                result.push({
                    type: "item",
                    data: item
                });
            });

            // Вычисляем общие суммы для corporate_person
            const corporateVolume = corporateItems.reduce((sum, item) => sum + (Number(item.volume) || 0), 0);
            const corporateVolumeConcrete = corporateItems.reduce((sum, item) => sum + (Number(item.volume_concrete) || 0), 0);
            
            // Вычисляем сумму сумм (volume + volume_concrete)
            const sumOfSums = corporateVolume + corporateVolumeConcrete;

            // Добавляем итог по volume и volume_concrete
            result.push({
                type: "corporate_total",
                volume: corporateVolume,
                volume_concrete: corporateVolumeConcrete
            });
            
            // Добавляем сумму сумм отдельной строкой
            result.push({
                type: "sum_of_sums",
                value: sumOfSums
            });
        });

        return result;
    };

    const flattenedData = groupData(data);

    const renderRow = (row, rowIndex) => {
        switch (row.type) {
            case "corporate_person":
                return (
                    <tr key={`corporate_person-${row.name}-${rowIndex}`} className="group-row corporate_person-row">
                        <td className="group-title" colSpan="17">{`Заявки ${row.name}`}</td>
                    </tr>
                );

            case "corporate_total":
                return (
                    <tr key={`corporate-total-${rowIndex}`} className="total-row corporate-total">
                        <td className="total-label"></td>
                        <td className="total-volume">{safeToFixed(row.volume)}</td>
                        <td className="total-volume-concrete">{safeToFixed(row.volume_concrete)}</td>
                        <td colSpan="14"></td>
                    </tr>
                );
                
            case "sum_of_sums":
                return (
                    <tr key={`sum-of-sums-${rowIndex}`} className="total-row sum-of-sums-row">
                        <td className="sum-label"></td>
                        <td className="sum-of-sums-value" colSpan="2">{safeToFixed(row.value)}</td>
                        <td colSpan="14"></td>
                    </tr>
                );

            case "item":
                const item = row.data;
                const uniqueKey = `item-${item.id}-${rowIndex}`;

                // Форматирование unloading_method
                let unloadingMethodFormatted = "-";
                if (item.unloading_method && Array.isArray(item.unloading_method)) {
                    unloadingMethodFormatted = item.unloading_method.join(", ");
                } else if (item.unloading_method) {
                    unloadingMethodFormatted = item.unloading_method;
                }

                return (
                    <tr key={uniqueKey} className="detail-row">
                        <td className="client_name">{item.client_name || "-"}</td>
                        <td className="volume">{safeToFixed(item.volume)}</td>
                        <td className="volume_concrete">{safeToFixed(item.volume_concrete)}</td>
                        <td className="class">{item.class || "-"}</td>
                        <td className="additions_antifreeze">{item.additions_antifreeze || "-"}</td>
                        <td className="mobility">{item.mobility || "-"}</td>
                        <td>???</td>
                        <td>???</td>
                        <td className="additions_chemical">{item.additions_chemical || "-"}</td>
                        <td>???</td>
                        <td>???</td>
                        <td>???</td>
                        <td className="unloading_method">{unloadingMethodFormatted}</td>
                        <td className="address">{item.address || "-"}</td>
                        <td className="manager">{item.manager || "-"}</td>
                        <td className="phone">{item.phone || "-"}</td>
                        <td>???</td>
                    </tr>
                );

            default:
                return null;
        }
    };

    return (
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                    <tr style={{ height: '100px', wordWrap: 'break-word', verticalAlign: 'top' }}>
                        <th>client_name</th>
                        <th>volume</th>
                        <th>volume_concrete</th>
                        <th>class</th>
                        <th>additions_antifreeze</th>
                        <th>mobility</th>
                        <th>???</th>
                        <th>???</th>
                        <th>additions_chemical</th>
                        <th>???</th>
                        <th>???</th>
                        <th>???</th>
                        <th>unloading_method</th>
                        <th>address</th>
                        <th>manager</th>
                        <th>phone</th>
                        <th>???</th>
                    </tr>
                </thead>
                <tbody>
                    {flattenedData.map((row, index) => renderRow(row, index))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;