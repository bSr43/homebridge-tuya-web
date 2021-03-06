import {
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
} from "homebridge";
import { TuyaWebCharacteristic } from "./base";
import { BaseAccessory } from "../BaseAccessory";
import { DeviceState } from "../../api/response";

export class ActiveCharacteristic extends TuyaWebCharacteristic {
  public static Title = "Characteristic.Active";

  public static HomekitCharacteristic(accessory: BaseAccessory) {
    return accessory.platform.Characteristic.Active;
  }

  public static isSupportedByAccessory(accessory): boolean {
    return accessory.deviceConfig.data.state !== undefined;
  }

  public getRemoteValue(callback: CharacteristicGetCallback): void {
    this.accessory
      .getDeviceState()
      .then((data) => {
        this.debug("[GET] %s", data?.state);
        this.updateValue(data, callback);
      })
      .catch(this.accessory.handleError("GET", callback));
  }

  public setRemoteValue(
    homekitValue: CharacteristicValue,
    callback: CharacteristicSetCallback
  ): void {
    // Set device state in Tuya Web API
    const value = homekitValue ? 1 : 0;

    this.accessory
      .setDeviceState("turnOnOff", { value }, { state: homekitValue })
      .then(() => {
        this.debug("[SET] %s %s", homekitValue, value);
        callback();
      })
      .catch(this.accessory.handleError("SET", callback));
  }

  updateValue(data: DeviceState, callback?: CharacteristicGetCallback): void {
    if (data?.state !== undefined) {
      const stateValue = String(data.state).toLowerCase() === "true";
      this.accessory.setCharacteristic(
        this.homekitCharacteristic,
        stateValue,
        !callback
      );
      callback && callback(null, stateValue);
    } else {
      callback && callback(new Error("Could not get state from data"));
    }
  }
}
