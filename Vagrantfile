Vagrant.configure("2") do |config|
  config.vm.box = "centos/7"

  config.vm.provider "virtualbox" do |vb|
    vb.name = "devbox-node"
    vb.cpus = 2
    vb.memory = 4096
    vb.customize ['modifyvm', :id, '--clipboard', 'bidirectional']
    vb.customize ['modifyvm', :id, '--vram', '32']
    vb.customize ['modifyvm', :id, '--usb', 'off']
    vb.customize ['modifyvm', :id, '--audio', 'none']
  end

  config.vm.hostname = "localhost"
  config.vm.provision "shell", path: "./provision.sh"

  #config.vm.network "private_network", ip: "192.168.55.5"
  #config.vm.network :forwarded_port, guest: 80, host: 80

  # cannot be enabled unless the box has the guest additions installed
  config.vm.synced_folder ".", "/vagrant", type: "nfs", disabled: true

end
